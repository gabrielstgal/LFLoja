package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.model.Banner;
import com.lfclothing.lfclothing.repository.BannerRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    @Cacheable("banners")
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
    @CacheEvict(value = "banners", allEntries = true)
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
    @CacheEvict(value = "banners", allEntries = true)
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Banner dados) {
        return bannerRepository.findById(id).map(banner -> {
            if (dados.getUrlImagem() != null && !dados.getUrlImagem().trim().isEmpty()) {
                if (!InputSanitizer.isValidUrl(dados.getUrlImagem())) {
                    return ResponseEntity.badRequest().body((Object) "URL da imagem invalida.");
                }
                banner.setUrlImagem(dados.getUrlImagem());
            }
            banner.setTitulo(InputSanitizer.sanitizeHtml(dados.getTitulo()));
            banner.setSubtitulo(InputSanitizer.sanitizeHtml(dados.getSubtitulo()));
            banner.setBadge(InputSanitizer.sanitizeHtml(dados.getBadge()));
            banner.setTextoBotao(InputSanitizer.sanitizeHtml(dados.getTextoBotao()));
            if (dados.getLink() != null && !dados.getLink().isBlank()) {
                if (!InputSanitizer.isValidUrl(dados.getLink())) {
                    return ResponseEntity.badRequest().body((Object) "URL do link invalida.");
                }
                banner.setLink(dados.getLink());
            } else {
                banner.setLink(dados.getLink());
            }
            banner.setOrdem(dados.getOrdem());
            banner.setAtivo(dados.isAtivo());
            return ResponseEntity.ok((Object) bannerRepository.save(banner));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @CacheEvict(value = "banners", allEntries = true)
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!bannerRepository.existsById(id)) return ResponseEntity.notFound().build();
        bannerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
