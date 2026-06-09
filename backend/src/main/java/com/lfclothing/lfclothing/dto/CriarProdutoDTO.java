package com.lfclothing.lfclothing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;

public record CriarProdutoDTO(
    @NotBlank @Size(max = 200) String nome,
    @Size(max = 1000) String descricao,
    @NotBlank @Size(max = 100) String categoria,
    @NotNull @Positive BigDecimal preco,
    BigDecimal precoPromocional,
    String urlImagem,
    Set<String> imagens,
    Map<String, Integer> estoqueTamanhos
) {}
