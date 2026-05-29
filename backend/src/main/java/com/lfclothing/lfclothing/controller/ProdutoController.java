package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.model.Produto;
import com.lfclothing.lfclothing.repository.ProdutoRepository;
import com.lfclothing.lfclothing.service.CloudinaryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.lfclothing.lfclothing.security.InputSanitizer;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoRepository produtoRepository;
    private final CloudinaryService cloudinaryService;

    public ProdutoController(ProdutoRepository produtoRepository, CloudinaryService cloudinaryService) {
        this.produtoRepository = produtoRepository;
        this.cloudinaryService = cloudinaryService;
    }

    private static final Set<String> TIPOS_IMAGEM_PERMITIDOS = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"
    );

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/upload-imagem")
    public ResponseEntity<?> uploadImagem(@RequestParam("arquivo") MultipartFile arquivo) {
        if (arquivo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Nenhum arquivo enviado."));
        }

        String contentType = arquivo.getContentType();
        if (contentType == null || !TIPOS_IMAGEM_PERMITIDOS.contains(contentType)) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Apenas imagens (JPEG, PNG, WebP, GIF) sao permitidas."));
        }

        String nomeOriginal = arquivo.getOriginalFilename();
        if (nomeOriginal != null && !nomeOriginal.matches("^[a-zA-Z0-9._\\-\\s()\\[\\]]+$")) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Nome de arquivo invalido. Renomeie sem acentos ou caracteres especiais."));
        }

        try {
            String urlImagem = cloudinaryService.upload(arquivo);
            return ResponseEntity.ok(Map.of("urlImagem", urlImagem));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("erro", "Falha ao enviar imagem."));
        }
    }

    @GetMapping
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    @GetMapping("/buscar")
    public Page<Produto> buscarProdutos(
            @RequestParam(required = false) List<String> categorias,
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String tamanhoFiltro,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho,
            @RequestParam(defaultValue = "id,desc") String[] ordenar) {

        Sort.Direction direcao = ordenar.length > 1 ? Sort.Direction.fromString(ordenar[1]) : Sort.Direction.DESC;
        String ordenarPor = ordenar.length > 0 ? ordenar[0] : "id";
        int tamanhoPaginacao = Math.min(tamanho, 100);
        Pageable pageable = PageRequest.of(pagina, tamanhoPaginacao, Sort.by(direcao, ordenarPor));

        if (busca != null && busca.length() > 100) {
            busca = busca.substring(0, 100);
        }
        boolean temBusca = busca != null && !busca.isBlank();
        boolean temCategorias = categorias != null && !categorias.isEmpty();
        boolean temTamanho = tamanhoFiltro != null && !tamanhoFiltro.isBlank();

        Page<Produto> resultado;
        if (temBusca && temCategorias) {
            resultado = produtoRepository.buscarPorTermoECategorias(busca, categorias, pageable);
        } else if (temBusca) {
            resultado = produtoRepository.buscarPorTermo(busca, pageable);
        } else if (temCategorias) {
            resultado = produtoRepository.findByCategoriaIn(categorias, pageable);
        } else {
            resultado = produtoRepository.findAll(pageable);
        }

        if (temTamanho) {
            List<Produto> filtrados = resultado.getContent().stream()
                    .filter(p -> p.getEstoqueTamanhos().containsKey(tamanhoFiltro)
                            && p.getEstoqueTamanhos().get(tamanhoFiltro) > 0)
                    .toList();
            return new org.springframework.data.domain.PageImpl<>(filtrados, pageable, filtrados.size());
        }

        return resultado;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return produtoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> criarProduto(@RequestBody Produto produto) {
        produto.setNome(InputSanitizer.sanitizeText(produto.getNome()));
        produto.setDescricao(InputSanitizer.sanitizeHtml(produto.getDescricao()));
        if (!InputSanitizer.isValidUrl(produto.getUrlImagem())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "URL da imagem invalida."));
        }
        produto.recalcularEstoqueTotal();
        return ResponseEntity.ok(produtoRepository.save(produto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Produto> atualizarProduto(@PathVariable Long id, @RequestBody Produto detalhesProduto) {
        return produtoRepository.findById(id).map(produto -> {
            produto.setNome(detalhesProduto.getNome());
            produto.setDescricao(detalhesProduto.getDescricao());
            produto.setCategoria(detalhesProduto.getCategoria());
            produto.setPreco(detalhesProduto.getPreco());
            produto.setPrecoPromocional(detalhesProduto.getPrecoPromocional());
            produto.setUrlImagem(detalhesProduto.getUrlImagem());
            produto.setImagens(detalhesProduto.getImagens());
            produto.setEstoqueTamanhos(detalhesProduto.getEstoqueTamanhos());
            return ResponseEntity.ok(produtoRepository.save(produto));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id) {
        if (!produtoRepository.existsById(id)) return ResponseEntity.notFound().build();
        produtoRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
