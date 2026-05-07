package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.model.Categoria;
import com.lfclothing.lfclothing.repository.CategoriaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    public CategoriaController(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public List<Categoria> listar() {
        return categoriaRepository.findAllByOrderByOrdemAsc();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Categoria categoria) {
        if (categoria.getNome() == null || categoria.getNome().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Nome da categoria é obrigatório.");
        }
        categoria.setNome(categoria.getNome().trim());
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Categoria dados) {
        return categoriaRepository.findById(id).map(cat -> {
            if (dados.getNome() != null && !dados.getNome().trim().isEmpty()) {
                cat.setNome(dados.getNome().trim());
            }
            if (dados.getUrlImagem() != null) {
                cat.setUrlImagem(dados.getUrlImagem());
            }
            cat.setOrdem(dados.getOrdem());
            return ResponseEntity.ok(categoriaRepository.save(cat));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!categoriaRepository.existsById(id)) return ResponseEntity.notFound().build();
        categoriaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
