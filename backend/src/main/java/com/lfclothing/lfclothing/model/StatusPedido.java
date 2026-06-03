package com.lfclothing.lfclothing.model;

import java.util.Map;
import java.util.Set;

public enum StatusPedido {
    PENDENTE,
    PAGO,
    ENVIADO,
    ENTREGUE,
    CANCELADO;

    private static final Map<StatusPedido, Set<StatusPedido>> TRANSICOES = Map.of(
        PENDENTE,  Set.of(PAGO, CANCELADO),
        PAGO,      Set.of(ENVIADO, CANCELADO),
        ENVIADO,   Set.of(ENTREGUE, CANCELADO),
        ENTREGUE,  Set.of(),
        CANCELADO, Set.of()
    );

    public boolean podeTransicionar(StatusPedido novoStatus) {
        return TRANSICOES.getOrDefault(this, Set.of()).contains(novoStatus);
    }
}
