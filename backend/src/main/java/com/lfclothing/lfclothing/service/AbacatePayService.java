package com.lfclothing.lfclothing.service;

import com.lfclothing.lfclothing.dto.abacatepay.AbacatePayCobrancaResponse;
import com.lfclothing.lfclothing.dto.abacatepay.CobrancaPixRequest;
import com.lfclothing.lfclothing.dto.abacatepay.CobrancaPixResposta;
import com.lfclothing.lfclothing.model.Pedido;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Cliente HTTP para a API da AbacatePay (PIX QR Code, API v1).
 * Documentacao: https://docs.abacatepay.com/api-reference/criar-qrcode-pix
 * Endpoints: POST /v1/pixQrCode/create, GET /v1/pixQrCode/check?id=...
 */
@Service
public class AbacatePayService {

    private static final Logger log = LoggerFactory.getLogger(AbacatePayService.class);

    private final RestClient restClient;
    private final int pixExpiresSeconds;

    public AbacatePayService(
            @Value("${abacatepay.api-key}") String apiKey,
            @Value("${abacatepay.base-url}") String baseUrl,
            @Value("${abacatepay.pix-expires-seconds}") int pixExpiresSeconds) {
        this.pixExpiresSeconds = pixExpiresSeconds;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
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

        var body = new CobrancaPixRequest(
                amountCentavos,
                pixExpiresSeconds,
                "Pedido " + pedido.getProtocolo() + " - LF Clothing",
                Map.of("pedidoId", String.valueOf(pedido.getId())),
                pedido.getProtocolo());

        AbacatePayCobrancaResponse resp = restClient.post()
                .uri("/pixQrCode/create")
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
                .uri(uriBuilder -> uriBuilder.path("/pixQrCode/check")
                        .queryParam("id", chargeId).build())
                .retrieve()
                .body(AbacatePayCobrancaResponse.class);

        if (resp == null || resp.data() == null || resp.data().status() == null) {
            log.error("Resposta invalida da AbacatePay ao consultar status do chargeId {}", chargeId);
            throw new IllegalStateException("Resposta invalida da AbacatePay ao consultar status");
        }
        return resp.data().status();
    }
}
