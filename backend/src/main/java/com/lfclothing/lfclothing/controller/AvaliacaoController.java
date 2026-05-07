package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.model.Avaliacao;
import com.lfclothing.lfclothing.model.Produto;
import com.lfclothing.lfclothing.model.Usuario;
import com.lfclothing.lfclothing.repository.AvaliacaoRepository;
import com.lfclothing.lfclothing.repository.ProdutoRepository;
import com.lfclothing.lfclothing.repository.UsuarioRepository;
import com.lfclothing.lfclothing.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoRepository avaliacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    public AvaliacaoController(AvaliacaoRepository avaliacaoRepository, ProdutoRepository produtoRepository, UsuarioRepository usuarioRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<?> listarPorProduto(@PathVariable Long produtoId) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByProdutoIdOrderByDataCriacaoDesc(produtoId);
        Double media = avaliacaoRepository.findMediaByProdutoId(produtoId);
        long total = avaliacaoRepository.countByProdutoId(produtoId);

        return ResponseEntity.ok(Map.of(
                "avaliacoes", avaliacoes,
                "media", media != null ? media : 0,
                "total", total
        ));
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/produto/{produtoId}")
    public ResponseEntity<?> criar(@PathVariable Long produtoId, @RequestBody Map<String, Object> body, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        if (avaliacaoRepository.existsByUsuarioIdAndProdutoId(userDetails.getId(), produtoId)) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Voce ja avaliou este produto."));
        }

        int nota = ((Number) body.get("nota")).intValue();
        if (nota < 1 || nota > 5) {
            return ResponseEntity.badRequest().body(Map.of("erro", "A nota deve ser entre 1 e 5."));
        }

        String comentario = (String) body.getOrDefault("comentario", "");
        if (comentario.length() > 500) {
            comentario = comentario.substring(0, 500);
        }

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto nao encontrado."));
        Usuario usuario = usuarioRepository.findById(userDetails.getId()).orElseThrow();

        Avaliacao avaliacao = new Avaliacao(produto, usuario, nota, comentario);
        avaliacaoRepository.save(avaliacao);

        return ResponseEntity.ok(Map.of("mensagem", "Avaliacao enviada com sucesso!"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!avaliacaoRepository.existsById(id)) return ResponseEntity.notFound().build();
        avaliacaoRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
