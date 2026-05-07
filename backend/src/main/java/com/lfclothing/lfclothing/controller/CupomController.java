package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.model.Cupom;
import com.lfclothing.lfclothing.repository.CupomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cupons")
public class CupomController {

    private final CupomRepository cupomRepository;

    public CupomController(CupomRepository cupomRepository) {
        this.cupomRepository = cupomRepository;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Cupom> listarTodos() {
        return cupomRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Cupom cupom) {
        cupom.setCodigo(cupom.getCodigo());
        if (cupomRepository.existsByCodigo(cupom.getCodigo())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Ja existe um cupom com este codigo."));
        }
        return ResponseEntity.ok(cupomRepository.save(cupom));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleAtivo(@PathVariable Long id) {
        return cupomRepository.findById(id).map(cupom -> {
            cupom.setAtivo(!cupom.isAtivo());
            return ResponseEntity.ok(cupomRepository.save(cupom));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!cupomRepository.existsById(id)) return ResponseEntity.notFound().build();
        cupomRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/validar")
    public ResponseEntity<?> validar(@RequestBody Map<String, String> body) {
        String codigo = body.getOrDefault("codigo", "").toUpperCase().trim();
        if (codigo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Digite um codigo de cupom."));
        }

        return cupomRepository.findByCodigoAndAtivoTrue(codigo)
                .map(cupom -> ResponseEntity.ok(Map.of(
                        "codigo", cupom.getCodigo(),
                        "tipo", cupom.getTipo().name(),
                        "valor", cupom.getValor()
                )))
                .orElse(ResponseEntity.badRequest().body(Map.of("erro", "Cupom invalido ou expirado.")));
    }
}
