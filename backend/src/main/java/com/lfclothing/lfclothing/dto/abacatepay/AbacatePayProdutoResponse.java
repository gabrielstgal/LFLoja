package com.lfclothing.lfclothing.dto.abacatepay;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Envelope de resposta da AbacatePay ({ data, success, error }) para
 * POST /v2/products/create. So precisamos do id publico do produto (prod_...).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AbacatePayProdutoResponse(Data data, Boolean success, Object error) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Data(String id) {}
}
