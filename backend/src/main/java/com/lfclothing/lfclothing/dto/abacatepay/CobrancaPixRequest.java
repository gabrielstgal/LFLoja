package com.lfclothing.lfclothing.dto.abacatepay;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

/**
 * Corpo da requisicao para POST /v1/pixQrCode/create da AbacatePay (API PIX QR Code).
 * Estrutura "flat" (sem wrapper method/data). Campos nulos sao omitidos do JSON.
 *
 * NOTA: o objeto "customer" e OMITIDO de proposito — quando enviado, a AbacatePay
 * exige CPF (taxId) e telefone (cellphone) validos, que nao temos no cadastro do
 * usuario. A reconciliacao e feita via metadata.pedidoId e externalId (protocolo).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CobrancaPixRequest(
        Long amount,
        Integer expiresIn,
        String description,
        Map<String, String> metadata,
        String externalId
) {}
