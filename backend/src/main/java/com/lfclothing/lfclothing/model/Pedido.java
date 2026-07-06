package com.lfclothing.lfclothing.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pedidos", indexes = {
    @Index(name = "idx_pedido_usuario", columnList = "usuario_id"),
    @Index(name = "idx_pedido_data", columnList = "data_criacao")
})
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private String protocolo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endereco_entrega_id")
    private Endereco enderecoEntrega;

    @Column(name = "valor_total", nullable = false)
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status = StatusPedido.PENDENTE;

    @Column(name = "cupom_codigo")
    private String cupomCodigo;

    @Column(name = "valor_desconto")
    private BigDecimal valorDesconto;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pagamento")
    private MetodoPagamento metodoPagamento;

    @Column(name = "pagamento_id")
    private String pagamentoId;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    public Pedido() {}

    public Pedido(Usuario usuario, BigDecimal valorTotal, StatusPedido status) {
        this.usuario = usuario;
        this.valorTotal = valorTotal;
        this.status = status != null ? status : StatusPedido.PENDENTE;
        this.dataCriacao = LocalDateTime.now();
    }

    @PrePersist
    private void gerarProtocolo() {
        if (this.protocolo == null) {
            String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            this.protocolo = "LF-" + uuid;
        }
    }

    public void adicionarItem(ItemPedido item) {
        itens.add(item);
        item.setPedido(this);
    }

    public void removerItem(ItemPedido item) {
        itens.remove(item);
        item.setPedido(null);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProtocolo() { return protocolo; }
    public void setProtocolo(String protocolo) { this.protocolo = protocolo; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public BigDecimal getValorTotal() { return valorTotal; }
    public void setValorTotal(BigDecimal valorTotal) { this.valorTotal = valorTotal; }

    public StatusPedido getStatus() { return status; }
    public void setStatus(StatusPedido status) { this.status = status; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }

    public List<ItemPedido> getItens() { return itens; }
    public void setItens(List<ItemPedido> itens) { this.itens = itens; }

    public Endereco getEnderecoEntrega() { return enderecoEntrega; }
    public void setEnderecoEntrega(Endereco enderecoEntrega) { this.enderecoEntrega = enderecoEntrega; }

    public String getCupomCodigo() { return cupomCodigo; }
    public void setCupomCodigo(String cupomCodigo) { this.cupomCodigo = cupomCodigo; }

    public BigDecimal getValorDesconto() { return valorDesconto; }
    public void setValorDesconto(BigDecimal valorDesconto) { this.valorDesconto = valorDesconto; }

    public MetodoPagamento getMetodoPagamento() { return metodoPagamento; }
    public void setMetodoPagamento(MetodoPagamento metodoPagamento) { this.metodoPagamento = metodoPagamento; }

    public String getPagamentoId() { return pagamentoId; }
    public void setPagamentoId(String pagamentoId) { this.pagamentoId = pagamentoId; }

}
