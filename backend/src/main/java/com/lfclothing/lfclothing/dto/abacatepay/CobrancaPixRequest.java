package com.lfclothing.lfclothing.dto.abacatepay;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

/**
 * Corpo da requisicao para POST /v2/transparents/create (Checkout Transparente PIX).
 * A v2 usa um discriminador no topo ("method") + um objeto "data" com os campos da
 * cobranca:
 * <pre>
 * { "method": "PIX", "data": { "amount": 14990, "expiresIn": 3600, ... } }
 * </pre>
 * Campos nulos sao omitidos do JSON.
 *
 * NOTA: o objeto "customer" e OPCIONAL para PIX (obrigatorio so para BOLETO) e por
 * isso e OMITIDO — nao temos CPF/telefone validos no cadastro. A reconciliacao e
 * feita via metadata.pedidoId e externalId (protocolo).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CobrancaPixRequest(String method, PixData data) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record PixData(
            Long amount,
            Integer expiresIn,
            String description,
            Map<String, String> metadata,
            String externalId
    ) {}

    /** Cria um request PIX ja com o discriminador method="PIX". */
    public static CobrancaPixRequest pix(Long amount, Integer expiresIn, String description,
                                         Map<String, String> metadata, String externalId) {
        return new CobrancaPixRequest("PIX", new PixData(amount, expiresIn, description, metadata, externalId));
    }
}
