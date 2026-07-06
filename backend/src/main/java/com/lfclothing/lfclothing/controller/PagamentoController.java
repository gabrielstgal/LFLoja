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

    public PagamentoController(PedidoRepository pedidoRepository, AbacatePayService abacatePayService,
                               PedidoPagamentoService pedidoPagamentoService, ObjectMapper objectMapper,
                               @Value("${abacatepay.webhook-secret}") String webhookSecret) {
        this.pedidoRepository = pedidoRepository;
        this.abacatePayService = abacatePayService;
        this.pedidoPagamentoService = pedidoPagamentoService;
        this.objectMapper = objectMapper;
        this.webhookSecret = webhookSecret;
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

        // Camada 2: assinatura HMAC (validada apenas se enviada)
        if (signature != null && !signature.isBlank()
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
            // API v1 PIX QR Code envia "billing.paid" quando a cobranca e paga.
            // Aceitamos tambem "transparent.completed" (v2) por robustez.
            if (!"billing.paid".equals(event) && !"transparent.completed".equals(event)) {
                // Outros eventos sao ignorados (no-op)
                return ResponseEntity.ok("ignored");
            }

            Long pedidoId = extrairPedidoId(payload);
            if (pedidoId == null) {
                log.error("Webhook transparent.completed sem pedido identificavel. body={}", rawBody);
                return ResponseEntity.ok("no-pedido");
            }

            pedidoPagamentoService.confirmarPagamento(pedidoId);
            log.info("Webhook AbacatePay: pagamento confirmado para pedido {}", pedidoId);
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            log.error("Erro ao processar webhook AbacatePay: {}", e.getMessage());
            return ResponseEntity.status(500).body("error");
        }
    }

    /** Resolve o pedido pelo metadata.pedidoId; fallback: id da cobranca (pagamentoId). */
    @SuppressWarnings("unchecked")
    private Long extrairPedidoId(Map<String, Object> payload) {
        Object dataObj = payload.get("data");
        if (!(dataObj instanceof Map)) {
            return null;
        }
        Map<String, Object> data = (Map<String, Object>) dataObj;

        Object metaObj = data.get("metadata");
        if (metaObj instanceof Map) {
            Object pid = ((Map<String, Object>) metaObj).get("pedidoId");
            if (pid != null && !pid.toString().isBlank()) {
                try {
                    return Long.parseLong(pid.toString().trim());
                } catch (NumberFormatException ignored) {
                    // cai no fallback abaixo
                }
            }
        }

        for (String campo : new String[]{"id", "pixId", "chargeId"}) {
            Object chargeId = data.get(campo);
            if (chargeId != null && !chargeId.toString().isBlank()) {
                var pedido = pedidoRepository.findByPagamentoId(chargeId.toString()).orElse(null);
                if (pedido != null) {
                    return pedido.getId();
                }
            }
        }
        return null;
    }

    private boolean assinaturaHmacValida(String rawBody, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
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
