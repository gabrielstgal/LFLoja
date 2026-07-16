package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.dto.abacatepay.CobrancaPixResposta;
import com.lfclothing.lfclothing.model.MetodoPagamento;
import com.lfclothing.lfclothing.model.Pedido;
import com.lfclothing.lfclothing.model.StatusPedido;
import com.lfclothing.lfclothing.repository.PedidoRepository;
import com.lfclothing.lfclothing.security.UserDetailsImpl;
import com.lfclothing.lfclothing.service.AbacatePayService;
import com.lfclothing.lfclothing.service.PedidoPagamentoService;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pagamentos")
public class PagamentoController {

    private static final Logger log = LoggerFactory.getLogger(PagamentoController.class);

    private final PedidoRepository pedidoRepository;
    private final AbacatePayService abacatePayService;
    private final PedidoPagamentoService pedidoPagamentoService;
    private final ObjectMapper objectMapper;
    private final String webhookSecret;
    private final String webhookPublicKey;

    public PagamentoController(PedidoRepository pedidoRepository, AbacatePayService abacatePayService,
                               PedidoPagamentoService pedidoPagamentoService, ObjectMapper objectMapper,
                               @Value("${abacatepay.webhook-secret}") String webhookSecret,
                               @Value("${abacatepay.webhook-public-key}") String webhookPublicKey) {
        this.pedidoRepository = pedidoRepository;
        this.abacatePayService = abacatePayService;
        this.pedidoPagamentoService = pedidoPagamentoService;
        this.objectMapper = objectMapper;
        this.webhookSecret = webhookSecret;
        this.webhookPublicKey = webhookPublicKey;
    }

    /**
     * Gera uma cobranca PIX (QR Code) para um pedido PENDENTE do usuario logado.
     * Nao confirma pagamento — apenas cria a cobranca na AbacatePay.
     */
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/pix/{pedidoId}")
    @Transactional
    public ResponseEntity<?> criarPix(@PathVariable Long pedidoId, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Pedido pedido = pedidoRepository.findByIdWithDetails(pedidoId).orElse(null);
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !pedido.getUsuario().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body("Pedido nao pertence ao usuario.");
        }

        if (pedido.getStatus() != StatusPedido.PENDENTE) {
            return ResponseEntity.badRequest().body("Este pedido nao esta pendente de pagamento.");
        }

        // AbacatePay exige valor minimo de R$ 1,00 (100 centavos) para cobranca PIX.
        if (pedido.getValorTotal() == null
                || pedido.getValorTotal().compareTo(new BigDecimal("1.00")) < 0) {
            return ResponseEntity.badRequest()
                    .body("O valor minimo para pagamento via PIX e R$ 1,00.");
        }

        try {
            CobrancaPixResposta cobranca = abacatePayService.criarCobrancaPix(pedido);

            pedido.setMetodoPagamento(MetodoPagamento.PIX);
            pedido.setPagamentoId(cobranca.id());
            pedidoRepository.save(pedido);

            var response = new LinkedHashMap<String, Object>();
            response.put("pagamentoId", cobranca.id());
            response.put("brCode", cobranca.brCode());
            response.put("brCodeBase64", cobranca.brCodeBase64());
            response.put("expiresAt", cobranca.expiresAt());
            response.put("status", cobranca.status());
            response.put("valorTotal", pedido.getValorTotal());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Falha ao gerar cobranca PIX para pedido {}: {}", pedidoId, e.getMessage());
            return ResponseEntity.status(502).body("Erro ao gerar cobranca PIX. Tente novamente.");
        }
    }

    /**
     * Consulta o status da cobranca PIX de um pedido (usado pelo polling do front).
     * Se a AbacatePay retornar PAID, confirma o pagamento (idempotente: desconta
     * estoque e marca PAGO apenas uma vez).
     */
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/pix/{pedidoId}/status")
    public ResponseEntity<?> statusPix(@PathVariable Long pedidoId, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Pedido pedido = pedidoRepository.findByIdWithDetails(pedidoId).orElse(null);
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !pedido.getUsuario().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body("Pedido nao pertence ao usuario.");
        }

        // Ja confirmado anteriormente (por outro polling ou pelo webhook)
        if (pedido.getStatus() == StatusPedido.PAGO) {
            return ResponseEntity.ok(java.util.Map.of("status", "PAID", "pedidoStatus", "PAGO"));
        }

        if (pedido.getPagamentoId() == null) {
            return ResponseEntity.badRequest().body("Nenhuma cobranca PIX gerada para este pedido.");
        }

        String status;
        try {
            status = abacatePayService.consultarStatus(pedido.getPagamentoId());
        } catch (Exception e) {
            log.error("Falha ao consultar status PIX do pedido {}: {}", pedidoId, e.getMessage());
            return ResponseEntity.status(502).body("Erro ao consultar status do pagamento.");
        }

        if ("PAID".equals(status)) {
            pedidoPagamentoService.confirmarPagamento(pedidoId);
        }

        Pedido atualizado = pedidoRepository.findById(pedidoId).orElse(pedido);
        var response = new LinkedHashMap<String, Object>();
        response.put("status", status);
        response.put("pedidoStatus", atualizado.getStatus().name());
        return ResponseEntity.ok(response);
    }

    /**
     * Webhook chamado pela AbacatePay quando um pagamento PIX e confirmado.
     * Endpoint publico — autenticidade validada por (1) segredo na query string e
     * (2) assinatura HMAC-SHA256 no header X-Webhook-Signature (quando enviada).
     * A confirmacao em si e idempotente (ver PedidoPagamentoService).
     */
    @PostMapping("/webhook/abacatepay")
    public ResponseEntity<?> webhookAbacatePay(
            @RequestBody(required = false) String rawBody,
            @RequestParam(value = "webhookSecret", required = false) String secretQuery,
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signature) {

        // Camada 1: segredo na query string (obrigatorio)
        if (webhookSecret == null || webhookSecret.isBlank() || !constantTimeEquals(webhookSecret, secretQuery)) {
            log.warn("Webhook AbacatePay rejeitado: segredo invalido ou nao configurado");
            return ResponseEntity.status(401).body("unauthorized");
        }

        // Camada 2: assinatura HMAC-SHA256 do header X-Webhook-Signature, calculada com a
        // CHAVE PUBLICA FIXA da AbacatePay (nao com o webhookSecret). Validada apenas quando a
        // chave publica estiver configurada E a assinatura vier no request; caso contrario a
        // Camada 1 (segredo na query) ja garante a autenticidade.
        if (webhookPublicKey != null && !webhookPublicKey.isBlank()
                && signature != null && !signature.isBlank()
                && rawBody != null && !assinaturaHmacValida(rawBody, signature)) {
            log.warn("Webhook AbacatePay rejeitado: assinatura HMAC invalida");
            return ResponseEntity.status(401).body("unauthorized");
        }

        if (rawBody == null || rawBody.isBlank()) {
            return ResponseEntity.ok("empty");
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(rawBody, Map.class);
            String event = String.valueOf(payload.getOrDefault("event", ""));
            // API v2: PIX transparente pago dispara "transparent.completed";
            // checkout hospedado (cartao/PIX) dispara "checkout.completed".
            // "billing.paid" (v1) mantido por robustez, mas nao vem na v2.
            if (!"transparent.completed".equals(event)
                    && !"checkout.completed".equals(event)
                    && !"billing.paid".equals(event)) {
                // Outros eventos sao ignorados (no-op)
                return ResponseEntity.ok("ignored");
            }

            Long pedidoId = extrairPedidoId(payload);
            if (pedidoId == null) {
                log.error("Webhook AbacatePay sem pedido identificavel.");
                return ResponseEntity.ok("no-pedido");
            }

            // RE-VERIFICACAO DE SEGURANCA: nunca confiar apenas no corpo do webhook.
            // Consultamos o status REAL da cobranca na AbacatePay antes de confirmar. Assim,
            // mesmo que o segredo da URL vaze e alguem forje um webhook, so confirmamos se a
            // cobranca daquele pedido estiver de fato paga na AbacatePay.
            Pedido pedido = pedidoRepository.findById(pedidoId).orElse(null);
            if (pedido == null) {
                return ResponseEntity.ok("no-pedido");
            }
            if (pedido.getStatus() == StatusPedido.PAGO) {
                return ResponseEntity.ok("ok"); // ja confirmado (idempotente)
            }
            String chargeId = pedido.getPagamentoId();
            if (chargeId == null || chargeId.isBlank()) {
                log.warn("Webhook AbacatePay: pedido {} sem cobranca associada; ignorado", pedidoId);
                return ResponseEntity.ok("sem-cobranca");
            }
            String statusReal;
            try {
                statusReal = abacatePayService.consultarStatus(chargeId);
            } catch (Exception e) {
                log.error("Webhook AbacatePay: falha ao re-verificar status do pedido {}: {}", pedidoId, e.getMessage());
                return ResponseEntity.status(502).body("retry"); // AbacatePay reenvia o webhook
            }
            if (!"PAID".equals(statusReal)) {
                log.warn("Webhook AbacatePay: cobranca do pedido {} nao esta paga (status {}); ignorado (possivel forja).",
                        pedidoId, statusReal);
                return ResponseEntity.ok("not-paid");
            }

            pedidoPagamentoService.confirmarPagamento(pedidoId);
            log.info("Webhook AbacatePay: pagamento confirmado para pedido {}", pedidoId);
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            log.error("Erro ao processar webhook AbacatePay: {}", e.getMessage());
            return ResponseEntity.status(500).body("error");
        }
    }

    /**
     * Resolve o pedido pelo metadata.pedidoId; fallback: id da cobranca (pagamentoId).
     * Na v2 o payload do webhook aninha os dados da cobranca em {@code data.transparent}
     * (PIX transparente) ou {@code data.checkout} (checkout hospedado), entao procuramos
     * nesses escopos alem da raiz de {@code data}.
     */
    @SuppressWarnings("unchecked")
    private Long extrairPedidoId(Map<String, Object> payload) {
        Object dataObj = payload.get("data");
        if (!(dataObj instanceof Map)) {
            return null;
        }
        Map<String, Object> data = (Map<String, Object>) dataObj;

        // Escopos onde os campos da cobranca podem estar: a raiz de data e os objetos
        // aninhados por tipo de cobranca da v2.
        java.util.List<Map<String, Object>> escopos = new java.util.ArrayList<>();
        escopos.add(data);
        for (String chave : new String[]{"transparent", "checkout", "pixQrCode", "billing"}) {
            if (data.get(chave) instanceof Map<?, ?> aninhado) {
                escopos.add((Map<String, Object>) aninhado);
            }
        }

        // 1) metadata.pedidoId em qualquer escopo
        for (Map<String, Object> escopo : escopos) {
            if (escopo.get("metadata") instanceof Map<?, ?> meta) {
                Object pid = ((Map<String, Object>) meta).get("pedidoId");
                if (pid != null && !pid.toString().isBlank()) {
                    try {
                        return Long.parseLong(pid.toString().trim());
                    } catch (NumberFormatException ignored) {
                        // tenta os proximos escopos / fallback abaixo
                    }
                }
            }
        }

        // 2) fallback: id da cobranca (pagamentoId gravado no pedido) em qualquer escopo
        for (Map<String, Object> escopo : escopos) {
            for (String campo : new String[]{"id", "pixId", "chargeId"}) {
                Object chargeId = escopo.get(campo);
                if (chargeId != null && !chargeId.toString().isBlank()) {
                    var pedido = pedidoRepository.findByPagamentoId(chargeId.toString()).orElse(null);
                    if (pedido != null) {
                        return pedido.getId();
                    }
                }
            }
        }
        return null;
    }

    private boolean assinaturaHmacValida(String rawBody, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookPublicKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            String esperado = Base64.getEncoder().encodeToString(digest);
            return constantTimeEquals(esperado, signature);
        } catch (Exception e) {
            log.error("Erro ao validar assinatura HMAC do webhook: {}", e.getMessage());
            return false;
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
