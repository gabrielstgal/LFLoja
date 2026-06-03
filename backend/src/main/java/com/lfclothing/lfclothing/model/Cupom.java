package com.lfclothing.lfclothing.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cupons")
public class Cupom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoCupom tipo;

    @Column(nullable = false)
    private BigDecimal valor;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "uso_maximo")
    private Integer usoMaximo;

    @Column(name = "uso_atual", nullable = false)
    private int usoAtual = 0;

    @Column(name = "data_expiracao")
    private LocalDateTime dataExpiracao;

    private LocalDateTime dataCriacao = LocalDateTime.now();

    public Cupom() {}

    public Cupom(String codigo, TipoCupom tipo, BigDecimal valor) {
        this.codigo = codigo.toUpperCase().trim();
        this.tipo = tipo;
        this.valor = valor;
    }

    public boolean isValido() {
        if (!ativo) return false;
        if (dataExpiracao != null && LocalDateTime.now().isAfter(dataExpiracao)) return false;
        if (usoMaximo != null && usoAtual >= usoMaximo) return false;
        return true;
    }

    public void incrementarUso() {
        this.usoAtual++;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo.toUpperCase().trim(); }

    public TipoCupom getTipo() { return tipo; }
    public void setTipo(TipoCupom tipo) { this.tipo = tipo; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public Integer getUsoMaximo() { return usoMaximo; }
    public void setUsoMaximo(Integer usoMaximo) { this.usoMaximo = usoMaximo; }

    public int getUsoAtual() { return usoAtual; }
    public void setUsoAtual(int usoAtual) { this.usoAtual = usoAtual; }

    public LocalDateTime getDataExpiracao() { return dataExpiracao; }
    public void setDataExpiracao(LocalDateTime dataExpiracao) { this.dataExpiracao = dataExpiracao; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
}
