package com.lfclothing.lfclothing.dto.abacatepay;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Envelope de resposta da AbacatePay ({ data, success, error }).
 * Serve tanto para /pixQrCode/create quanto para /pixQrCode/check
 * (campos ausentes em um ou outro vem como null). Ignora campos desconhecidos
 * para nao quebrar com mudancas de schema da API.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AbacatePayCobrancaResponse(Data data, Boolean success, Object error) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Data(
            String id,
            Long amount,
            String status,
            String brCode,
            String brCodeBase64,
            String expiresAt
    ) {}
}
