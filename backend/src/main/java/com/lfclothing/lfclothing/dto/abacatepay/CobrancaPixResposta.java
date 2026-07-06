package com.lfclothing.lfclothing.dto.abacatepay;

/**
 * Resultado simplificado de uma cobranca PIX, exposto pelo AbacatePayService
 * para o restante da aplicacao (desacopla do envelope cru da API).
 */
public record CobrancaPixResposta(
        String id,
        String status,
        String brCode,
        String brCodeBase64,
        String expiresAt
) {}
