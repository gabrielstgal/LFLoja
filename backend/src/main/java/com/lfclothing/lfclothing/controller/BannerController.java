package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.model.Banner;
import com.lfclothing.lfclothing.repository.BannerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.lfclothing.lfclothing.security.InputSanitizer;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    private final BannerRepository bannerRepository;

    public BannerController(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    @GetMapping
    public List<Banner> listarAtivos() {
        return bannerRepository.findByAtivoTrueOrderByOrdemAsc();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/todos")
    public List<Banner> listarTodos() {
        return bannerRepository.findAllByOrderByOrdemAsc();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Banner banner) {
        if (banner.getUrlImagem() == null || banner.getUrlImagem().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("A imagem do banner é obrigatória.");
        }
        if (!InputSanitizer.isValidUrl(banner.getUrlImagem())) {
            return ResponseEntity.badRequest().body("URL da imagem invalida.");
        }
        banner.setTitulo(InputSanitizer.sanitizeHtml(banner.getTitulo()));
        banner.setSubtitulo(InputSanitizer.sanitizeHtml(banner.getSubtitulo()));
        banner.setBadge(InputSanitizer.sanitizeHtml(banner.getBadge()));
        banner.setTextoBotao(InputSanitizer.sanitizeHtml(banner.getTextoBotao()));
        return ResponseEntity.ok(bannerRepository.save(banner));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Banner dados) {
        return bannerRepository.findById(id).map(banner -> {
            if (dados.getUrlImagem() != null && !dados.getUrlImagem().trim().isEmpty()) {
                banner.setUrlImagem(dados.getUrlImagem());
            }
            banner.setTitulo(dados.getTitulo());
            banner.setSubtitulo(dados.getSubtitulo());
            banner.setBadge(dados.getBadge());
            banner.setTextoBotao(dados.getTextoBotao());
            banner.setLink(dados.getLink());
            banner.setOrdem(dados.getOrdem());
            banner.setAtivo(dados.isAtivo());
            return ResponseEntity.ok(bannerRepository.save(banner));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!bannerRepository.existsById(id)) return ResponseEntity.notFound().build();
        bannerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
