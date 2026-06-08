package com.lfclothing.lfclothing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PedidoRequisicao(
        @NotEmpty(message = "O pedido deve conter ao menos um item")
        List<@Valid ItemPedidoRequisicao> itens,
        @Size(max = 20) String cupom,
        @Size(max = 200) String rua,
        @Size(max = 20) String numero,
        @Size(max = 100) String complemento,
        @Size(max = 100) String bairro,
        @Size(max = 100) String cidade,
        @Size(max = 2) String estado,
        @Size(max = 9) String cep
) {}
