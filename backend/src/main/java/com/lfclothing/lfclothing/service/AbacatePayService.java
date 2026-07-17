package com.lfclothing.lfclothing.service;

import com.lfclothing.lfclothing.dto.abacatepay.AbacatePayCheckoutResponse;
import com.lfclothing.lfclothing.dto.abacatepay.AbacatePayCobrancaResponse;
import com.lfclothing.lfclothing.dto.abacatepay.AbacatePayProdutoResponse;
import com.lfclothing.lfclothing.dto.abacatepay.CheckoutCartaoRequest;
import com.lfclothing.lfclothing.dto.abacatepay.CheckoutCartaoResposta;
import com.lfclothing.lfclothing.dto.abacatepay.CobrancaPixRequest;
import com.lfclothing.lfclothing.dto.abacatepay.CobrancaPixResposta;
import com.lfclothing.lfclothing.dto.abacatepay.ProdutoAbacateRequest;
import com.lfclothing.lfclothing.model.Pedido;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Cliente HTTP para a API da AbacatePay v2 (Checkout Transparente PIX).
 * Documentacao: https://docs.abacatepay.com/pages/transparents/create
 * Endpoints: POST /v2/transparents/create, GET /v2/transparents/check?id=...
 */
@Service
public class AbacatePayService {

    private static final Logger log = LoggerFactory.getLogger(AbacatePayService.class);

    private final RestClient restClient;
    private final int pixExpiresSeconds;
    private final String frontendBaseUrl;

    /** Numero maximo de parcelas no credito (min. R$ 10,00 por parcela na AbacatePay). */
    private static final int MAX_PARCELAS_CREDITO = 6;

    public AbacatePayService(
            @Value("${abacatepay.api-key}") String apiKey,
            @Value("${abacatepay.base-url}") String baseUrl,
            @Value("${abacatepay.pix-expires-seconds}") int pixExpiresSeconds,
            @Value("${app.frontend-base-url}") String frontendBaseUrl) {
        this.pixExpiresSeconds = pixExpiresSeconds;
        this.frontendBaseUrl = frontendBaseUrl;
        // Timeouts para nao prender threads/conexoes do Tomcat caso a AbacatePay fique
        // lenta ou nao responda (5s para conectar, 10s para ler a resposta).
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Cria uma cobranca PIX para um pedido. Valor convertido para centavos.
     * Usa o protocolo do pedido como externalId (idempotencia) e grava o id do
     * pedido em metadata para reconciliacao via webhook.
     */
    public CobrancaPixResposta criarCobrancaPix(Pedido pedido) {
        long amountCentavos = pedido.getValorTotal()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        var body = CobrancaPixRequest.pix(
                amountCentavos,
                pixExpiresSeconds,
                "Pedido " + pedido.getProtocolo() + " - LF Clothing",
                Map.of("pedidoId", String.valueOf(pedido.getId())),
                pedido.getProtocolo());

        AbacatePayCobrancaResponse resp = restClient.post()
                .uri("/transparents/create")
                .body(body)
                .retrieve()
                .body(AbacatePayCobrancaResponse.class);

        if (resp == null || resp.data() == null || resp.data().id() == null) {
            log.error("Resposta invalida da AbacatePay ao criar cobranca PIX para pedido {}", pedido.getId());
            throw new IllegalStateException("Resposta invalida da AbacatePay ao criar cobranca PIX");
        }

        var d = resp.data();
        log.info("Cobranca PIX criada: pedido={} chargeId={} status={}", pedido.getId(), d.id(), d.status());
        return new CobrancaPixResposta(d.id(), d.status(), d.brCode(), d.brCodeBase64(), d.expiresAt());
    }

    /**
     * Consulta o status de uma cobranca PIX. Retorna o status cru da AbacatePay
     * (PENDING, PAID, EXPIRED, ...).
     */
    public String consultarStatus(String chargeId) {
        AbacatePayCobrancaResponse resp = restClient.get()
                .uri(uriBuilder -> uriBuilder.path("/transparents/check")
                        .queryParam("id", chargeId).build())
                .retrieve()
                .body(AbacatePayCobrancaResponse.class);

        if (resp == null || resp.data() == null || resp.data().status() == null) {
            log.error("Resposta invalida da AbacatePay ao consultar status do chargeId {}", chargeId);
            throw new IllegalStateException("Resposta invalida da AbacatePay ao consultar status");
        }
        return resp.data().status();
    }

    /**
     * Cria um checkout hospedado de CARTAO para um pedido. Como o /checkouts/create
     * calcula o total a partir de produtos pre-cadastrados (nao aceita valor avulso),
     * primeiro criamos um produto DESCARTAVEL com o valor total do pedido (ja com
     * promocoes/cupom aplicados pelo nosso servidor) e depois criamos o checkout
     * apontando para ele. O cliente e redirecionado para a {@code url} retornada.
     *
     * @param credito true = credito (parcela ate {@value #MAX_PARCELAS_CREDITO}x);
     *                false = debito (a vista, 1x).
     */
    public CheckoutCartaoResposta criarCheckoutCartao(Pedido pedido, boolean credito) {
        long amountCentavos = pedido.getValorTotal()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        // 1) Produto descartavel com o preco calculado no nosso servidor.
        // externalId unico (inclui sufixo aleatorio) para nao colidir em novas tentativas.
        String produtoExternalId = "LFPED-" + pedido.getId() + "-" + UUID.randomUUID().toString().substring(0, 8);
        var produtoBody = ProdutoAbacateRequest.of(
                produtoExternalId,
                "Pedido " + pedido.getProtocolo() + " - LF Clothing",
                amountCentavos);

        AbacatePayProdutoResponse prodResp = restClient.post()
                .uri("/products/create")
                .body(produtoBody)
                .retrieve()
                .body(AbacatePayProdutoResponse.class);

        if (prodResp == null || prodResp.data() == null || prodResp.data().id() == null) {
            log.error("Resposta invalida da AbacatePay ao criar produto para pedido {}", pedido.getId());
            throw new IllegalStateException("Resposta invalida da AbacatePay ao criar produto");
        }
        String produtoId = prodResp.data().id();

        // 2) Checkout de cartao apontando para o produto. Parcelas limitadas ao maximo
        // que respeita o minimo de R$ 10,00 por parcela.
        int maxParcelas = credito
                ? Math.max(1, Math.min(MAX_PARCELAS_CREDITO, (int) (amountCentavos / 1000)))
                : 1;

        var checkoutBody = new CheckoutCartaoRequest(
                List.of(new CheckoutCartaoRequest.Item(produtoId, 1)),
                List.of("CARD"),
                new CheckoutCartaoRequest.Card(maxParcelas),
                pedido.getProtocolo(),
                frontendBaseUrl + "/checkout",
                frontendBaseUrl + "/pagamento/cartao/" + pedido.getId() + "/retorno",
                Map.of("pedidoId", String.valueOf(pedido.getId())));

        AbacatePayCheckoutResponse resp = restClient.post()
                .uri("/checkouts/create")
                .body(checkoutBody)
                .retrieve()
                .body(AbacatePayCheckoutResponse.class);

        if (resp == null || resp.data() == null || resp.data().id() == null || resp.data().url() == null) {
            log.error("Resposta invalida da AbacatePay ao criar checkout de cartao para pedido {}", pedido.getId());
            throw new IllegalStateException("Resposta invalida da AbacatePay ao criar checkout de cartao");
        }

        var d = resp.data();
        log.info("Checkout cartao criado: pedido={} checkoutId={} status={}", pedido.getId(), d.id(), d.status());
        return new CheckoutCartaoResposta(d.id(), d.url(), d.status());
    }

    /**
     * Consulta o status de um checkout de cartao (GET /checkouts/get?id=...).
     * Retorna o status cru da AbacatePay (PENDING, PAID, EXPIRED, CANCELLED, REFUNDED).
     */
    public String consultarStatusCheckout(String checkoutId) {
        AbacatePayCheckoutResponse resp = restClient.get()
                .uri(uriBuilder -> uriBuilder.path("/checkouts/get")
                        .queryParam("id", checkoutId).build())
                .retrieve()
                .body(AbacatePayCheckoutResponse.class);

        if (resp == null || resp.data() == null || resp.data().status() == null) {
            log.error("Resposta invalida da AbacatePay ao consultar status do checkout {}", checkoutId);
            throw new IllegalStateException("Resposta invalida da AbacatePay ao consultar status do checkout");
        }
        return resp.data().status();
    }
}
