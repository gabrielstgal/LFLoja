package com.lfclothing.lfclothing.dto.abacatepay;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Envelope de resposta da AbacatePay ({ data, success, error }) para
 * POST /v2/checkouts/create e GET /v2/checkouts/get. Ignora campos desconhecidos.
 * O cliente e redirecionado para {@code data.url} para finalizar o pagamento.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AbacatePayCheckoutResponse(Data data, Boolean success, Object error) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Data(
            String id,
            String url,
            String status,
            Long amount
    ) {}
}
