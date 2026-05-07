package com.lfclothing.lfclothing.dto;

import java.util.List;

public record JwtResposta(Long id, String nome, String email, List<String> papeis) {}
