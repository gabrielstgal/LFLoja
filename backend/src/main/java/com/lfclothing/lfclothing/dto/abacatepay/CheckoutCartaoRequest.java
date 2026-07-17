package com.lfclothing.lfclothing.dto.abacatepay;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

/**
 * Corpo da requisicao para POST /v2/checkouts/create (checkout hospedado de cartao).
 * O total e calculado a partir dos {@code items} (produtos pre-cadastrados na
 * AbacatePay) — aqui usamos o produto descartavel criado por pedido.
 * Campos nulos sao omitidos do JSON.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CheckoutCartaoRequest(
        List<Item> items,
        List<String> methods,
        Card card,
        String externalId,
        String returnUrl,
        String completionUrl,
        Map<String, String> metadata
) {
    public record Item(String id, int quantity) {}

    /** maxInstallments: numero maximo de parcelas exibido na tela de pagamento (1..12). */
    public record Card(int maxInstallments) {}
}
