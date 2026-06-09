package com.lfclothing.lfclothing.repository;

import com.lfclothing.lfclothing.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHashAndRevogadoFalse(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revogado = true WHERE rt.email = :email AND rt.revogado = false")
    int revogarTodosPorEmail(@Param("email") String email);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiracao < :agora OR rt.revogado = true")
    int limparExpiradosERevogados(@Param("agora") Instant agora);
}
