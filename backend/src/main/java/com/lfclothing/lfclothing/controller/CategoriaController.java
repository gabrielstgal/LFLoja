package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.model.Categoria;
import com.lfclothing.lfclothing.repository.CategoriaRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.lfclothing.lfclothing.security.InputSanitizer;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    @Cacheable("categorias")
    public List<Categoria> listar() {
        return categoriaRepository.findAllByOrderByOrdemAsc();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @CacheEvict(value = "categorias", allEntries = true)
    public ResponseEntity<?> criar(@RequestBody Categoria categoria) {
        String nome = InputSanitizer.sanitizeText(categoria.getNome());
        if (nome == null || nome.isBlank()) {
            return ResponseEntity.badRequest().body("Nome da categoria é obrigatório.");
        }
        if (!InputSanitizer.isValidUrl(categoria.getUrlImagem())) {
            return ResponseEntity.badRequest().body("URL da imagem invalida.");
        }
        categoria.setNome(nome);
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    @CacheEvict(value = "categorias", allEntries = true)
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Categoria dados) {
        return categoriaRepository.findById(id).map(cat -> {
            if (dados.getNome() != null && !dados.getNome().trim().isEmpty()) {
                cat.setNome(InputSanitizer.sanitizeText(dados.getNome()));
            }
            if (dados.getUrlImagem() != null) {
                if (!InputSanitizer.isValidUrl(dados.getUrlImagem())) {
                    return ResponseEntity.badRequest().body((Object) "URL da imagem invalida.");
                }
                cat.setUrlImagem(dados.getUrlImagem());
            }
            cat.setOrdem(dados.getOrdem());
            return ResponseEntity.ok(categoriaRepository.save(cat));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @CacheEvict(value = "categorias", allEntries = true)
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!categoriaRepository.existsById(id)) return ResponseEntity.notFound().build();
        categoriaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
