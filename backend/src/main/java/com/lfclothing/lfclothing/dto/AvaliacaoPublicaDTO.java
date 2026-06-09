package com.lfclothing.lfclothing.dto;

import com.lfclothing.lfclothing.model.Avaliacao;
import java.time.LocalDateTime;

public record AvaliacaoPublicaDTO(
    Long id,
    int nota,
    String comentario,
    LocalDateTime dataCriacao,
    UsuarioResumoDTO usuario
) {
    public record UsuarioResumoDTO(Long id, String nome) {}

    public static AvaliacaoPublicaDTO fromEntity(Avaliacao a) {
        return new AvaliacaoPublicaDTO(
            a.getId(),
            a.getNota(),
            a.getComentario(),
            a.getDataCriacao(),
            new UsuarioResumoDTO(a.getUsuario().getId(), a.getUsuario().getNome())
        );
    }
}
