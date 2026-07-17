package com.lfclothing.lfclothing.dto.abacatepay;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Corpo da requisicao para POST /v2/products/create.
 * Obrigatorios: externalId, name, price (em centavos) e currency ("BRL").
 *
 * <p>Estrategia da loja: em vez de espelhar o catalogo na AbacatePay, criamos um
 * produto DESCARTAVEL por pedido com o valor total ja calculado pelo nosso servidor
 * (promocoes + cupom aplicados). Assim o preco continua sendo a nossa fonte de
 * verdade — igual ao fluxo PIX — e o checkout de cartao cobra o valor correto.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProdutoAbacateRequest(
        String externalId,
        String name,
        Long price,
        String currency
) {
    public static ProdutoAbacateRequest of(String externalId, String name, long priceCentavos) {
        return new ProdutoAbacateRequest(externalId, name, priceCentavos, "BRL");
    }
}
