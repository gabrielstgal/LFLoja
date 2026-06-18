package com.lfclothing.lfclothing.dto.abacatepay;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

/**
 * Corpo da requisicao para POST /v2/transparents/create da AbacatePay.
 * Campos nulos sao omitidos do JSON.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CobrancaPixRequest(String method, Data data) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Data(
            Long amount,
            String description,
            Integer expiresIn,
            Customer customer,
            Map<String, String> metadata,
            String externalId
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Customer(String name, String email, String taxId, String cellphone) {}
}
