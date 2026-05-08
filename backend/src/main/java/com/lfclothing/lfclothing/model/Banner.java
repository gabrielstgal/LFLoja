package com.lfclothing.lfclothing.model;

import jakarta.persistence.*;

@Entity
@Table(name = "banners")
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String urlImagem;

    @Column
    private String titulo;

    @Column
    private String subtitulo;

    @Column
    private String badge;

    @Column
    private String textoBotao;

    @Column
    private String link;

    @Column(nullable = false)
    private int ordem = 0;

    @Column(nullable = false)
    private boolean ativo = true;

    public Banner() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUrlImagem() { return urlImagem; }
    public void setUrlImagem(String urlImagem) { this.urlImagem = urlImagem; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getSubtitulo() { return subtitulo; }
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getTextoBotao() { return textoBotao; }
    public void setTextoBotao(String textoBotao) { this.textoBotao = textoBotao; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public int getOrdem() { return ordem; }
    public void setOrdem(int ordem) { this.ordem = ordem; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
