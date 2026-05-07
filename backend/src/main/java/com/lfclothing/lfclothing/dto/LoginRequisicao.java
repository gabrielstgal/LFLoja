package com.lfclothing.lfclothing.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequisicao(@NotBlank String email, @NotBlank String senha) {}
