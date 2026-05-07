package com.lfclothing.lfclothing.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.*;

@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(length = 1000)
    private String descricao;

    @Column(nullable = false)
    private String categoria;

    @Column(nullable = false)
    private BigDecimal preco;

    @Column(name = "url_imagem")
    private String urlImagem;

    @Column(name = "preco_promocional")
    private BigDecimal precoPromocional;

    @Column(name = "quantidade_estoque", nullable = false)
    private Integer quantidadeEstoque = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "imagens_produto", joinColumns = @JoinColumn(name = "produto_id"))
    @Column(name = "url")
    private Set<String> imagens = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "estoque_tamanho", joinColumns = @JoinColumn(name = "produto_id"))
    @MapKeyColumn(name = "tamanho")
    @Column(name = "quantidade")
    private Map<String, Integer> estoqueTamanhos = new LinkedHashMap<>();

    public Produto() {}

    public Produto(String nome, String descricao, String categoria, BigDecimal preco, String urlImagem, Integer quantidadeEstoque) {
        this.nome = nome;
        this.descricao = descricao;
        this.categoria = categoria;
        this.preco = preco;
        this.urlImagem = urlImagem;
        this.quantidadeEstoque = quantidadeEstoque;
    }

    @JsonProperty("tamanhos")
    public List<String> getTamanhos() {
        return new ArrayList<>(estoqueTamanhos.keySet());
    }

    public void recalcularEstoqueTotal() {
        this.quantidadeEstoque = estoqueTamanhos.values().stream().mapToInt(Integer::intValue).sum();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }

    public String getUrlImagem() { return urlImagem; }
    public void setUrlImagem(String urlImagem) { this.urlImagem = urlImagem; }

    public BigDecimal getPrecoPromocional() { return precoPromocional; }
    public void setPrecoPromocional(BigDecimal precoPromocional) { this.precoPromocional = precoPromocional; }

    public Integer getQuantidadeEstoque() { return quantidadeEstoque; }
    public void setQuantidadeEstoque(Integer quantidadeEstoque) { this.quantidadeEstoque = quantidadeEstoque; }

    public Set<String> getImagens() { return imagens; }
    public void setImagens(Set<String> imagens) { this.imagens = imagens; }

    public Map<String, Integer> getEstoqueTamanhos() { return estoqueTamanhos; }
    public void setEstoqueTamanhos(Map<String, Integer> estoqueTamanhos) {
        this.estoqueTamanhos = estoqueTamanhos;
        recalcularEstoqueTotal();
    }
}
