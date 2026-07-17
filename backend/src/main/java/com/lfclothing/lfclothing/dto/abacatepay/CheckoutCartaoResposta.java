package com.lfclothing.lfclothing.dto.abacatepay;

/**
 * Resposta interna (nao e o JSON da AbacatePay) devolvida pelo AbacatePayService
 * ao criar um checkout de cartao: id da cobranca (bill_...), URL hospedada para
 * redirecionar o cliente e status inicial.
 */
public record CheckoutCartaoResposta(String id, String url, String status) {}
