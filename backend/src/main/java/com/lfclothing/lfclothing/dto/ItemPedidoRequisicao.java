package com.lfclothing.lfclothing.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ItemPedidoRequisicao(
        @NotNull Long produtoId,
        @NotNull @Min(1) Integer quantidade,
        @Size(max = 10) String tamanho
) {}
