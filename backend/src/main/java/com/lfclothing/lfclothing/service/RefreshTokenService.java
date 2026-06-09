package com.lfclothing.lfclothing.service;

import com.lfclothing.lfclothing.model.RefreshToken;
import com.lfclothing.lfclothing.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private static final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class);

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Persiste um refresh token no banco (armazena apenas o hash SHA-256).
     */
    @Transactional
    public void salvar(String tokenJwt, String email, Instant expiracao) {
        String hash = hashToken(tokenJwt);
        RefreshToken rt = new RefreshToken(hash, email, expiracao);
        refreshTokenRepository.save(rt);
    }

    /**
     * Valida se o refresh token existe no banco e nao foi revogado/expirado.
     * Retorna o RefreshToken se valido, empty se invalido.
     */
    public Optional<RefreshToken> validar(String tokenJwt) {
        String hash = hashToken(tokenJwt);
        return refreshTokenRepository.findByTokenHashAndRevogadoFalse(hash)
                .filter(rt -> !rt.isExpirado());
    }

    /**
     * Rotacao: revoga o token antigo e persiste o novo.
     */
    @Transactional
    public void rotacionar(String tokenAntigoJwt, String tokenNovoJwt, String email, Instant novaExpiracao) {
        // Revoga o token antigo
        String hashAntigo = hashToken(tokenAntigoJwt);
        refreshTokenRepository.findByTokenHashAndRevogadoFalse(hashAntigo)
                .ifPresent(rt -> {
                    rt.setRevogado(true);
                    refreshTokenRepository.save(rt);
                });
        // Salva o novo
        salvar(tokenNovoJwt, email, novaExpiracao);
    }

    /**
     * Revoga todos os refresh tokens de um usuario (logout, exclusao de conta, troca de senha).
     */
    @Transactional
    public void revogarTodos(String email) {
        int revogados = refreshTokenRepository.revogarTodosPorEmail(email);
        if (revogados > 0) {
            logger.info("Revogados {} refresh tokens para: {}", revogados, email);
        }
    }

    /**
     * Limpeza periodica de tokens expirados/revogados (a cada 6 horas).
     */
    @Scheduled(fixedRate = 6 * 60 * 60 * 1000)
    @Transactional
    public void limparTokensExpirados() {
        int removidos = refreshTokenRepository.limparExpiradosERevogados(Instant.now());
        if (removidos > 0) {
            logger.info("Limpeza de refresh tokens: {} removidos.", removidos);
        }
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 nao disponivel", e);
        }
    }
}
