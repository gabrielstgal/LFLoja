package com.lfclothing.lfclothing.dto;

import com.lfclothing.lfclothing.model.TipoCupom;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CriarCupomDTO(
    @NotBlank @Size(max = 50) String codigo,
    @NotNull TipoCupom tipo,
    @NotNull @Positive BigDecimal valor,
    Integer usoMaximo,
    LocalDateTime dataExpiracao
) {}
