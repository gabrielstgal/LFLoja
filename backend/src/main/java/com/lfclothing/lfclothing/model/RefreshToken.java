package com.lfclothing.lfclothing.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_refresh_token_hash", columnList = "tokenHash", unique = true),
    @Index(name = "idx_refresh_token_email", columnList = "email")
})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private Instant expiracao;

    @Column(nullable = false)
    private boolean revogado = false;

    @Column(nullable = false)
    private Instant criadoEm = Instant.now();

    public RefreshToken() {}

    public RefreshToken(String tokenHash, String email, Instant expiracao) {
        this.tokenHash = tokenHash;
        this.email = email;
        this.expiracao = expiracao;
    }

    public Long getId() { return id; }

    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Instant getExpiracao() { return expiracao; }
    public void setExpiracao(Instant expiracao) { this.expiracao = expiracao; }

    public boolean isRevogado() { return revogado; }
    public void setRevogado(boolean revogado) { this.revogado = revogado; }

    public Instant getCriadoEm() { return criadoEm; }

    public boolean isExpirado() {
        return Instant.now().isAfter(expiracao);
    }
}
