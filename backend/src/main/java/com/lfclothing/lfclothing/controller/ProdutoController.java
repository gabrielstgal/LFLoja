package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.dto.CriarProdutoDTO;
import com.lfclothing.lfclothing.model.Produto;
import com.lfclothing.lfclothing.repository.ProdutoRepository;
import com.lfclothing.lfclothing.service.CloudinaryService;
import jakarta.validation.Valid;
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

    private static final Set<String> CAMPOS_ORDENACAO_PERMITIDOS = Set.of(
            "id", "nome", "preco", "categoria", "quantidadeEstoque", "precoPromocional"
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

        // Validacao de magic bytes (nao confiar apenas no Content-Type do cliente)
        try {
            byte[] header = new byte[12];
            int read = arquivo.getInputStream().read(header);
            if (read < 4 || !isValidImageMagicBytes(header)) {
                return ResponseEntity.badRequest().body(Map.of("erro", "Arquivo nao e uma imagem valida."));
            }
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Erro ao ler arquivo."));
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
    public Page<Produto> listarTodos(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamanho) {
        int tamanhoPaginacao = Math.min(tamanho, 100);
        Pageable pageable = PageRequest.of(pagina, tamanhoPaginacao, Sort.by(Sort.Direction.DESC, "id"));
        return produtoRepository.findAll(pageable);
    }

    @GetMapping("/buscar")
    public Page<Produto> buscarProdutos(
            @RequestParam(required = false) List<String> categorias,
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String tamanhoFiltro,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho,
            @RequestParam(defaultValue = "id,desc") String[] ordenar) {

        Sort.Direction direcao = Sort.Direction.DESC;
        if (ordenar.length > 1) {
            String dir = ordenar[1].trim().toUpperCase();
            if ("ASC".equals(dir) || "DESC".equals(dir)) {
                direcao = Sort.Direction.fromString(dir);
            }
        }
        String ordenarPor = ordenar.length > 0 ? ordenar[0] : "id";
        if (!CAMPOS_ORDENACAO_PERMITIDOS.contains(ordenarPor)) {
            ordenarPor = "id";
        }
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
    public ResponseEntity<?> criarProduto(@Valid @RequestBody CriarProdutoDTO dto) {
        Produto produto = new Produto();
        produto.setNome(InputSanitizer.sanitizeText(dto.nome()));
        produto.setDescricao(dto.descricao() != null ? InputSanitizer.sanitizeHtml(dto.descricao()) : "");
        produto.setCategoria(InputSanitizer.sanitizeText(dto.categoria()));
        produto.setPreco(dto.preco());
        produto.setPrecoPromocional(dto.precoPromocional());
        if (!InputSanitizer.isValidUrl(dto.urlImagem())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "URL da imagem invalida."));
        }
        produto.setUrlImagem(dto.urlImagem());
        if (dto.imagens() != null) produto.setImagens(dto.imagens());
        if (dto.estoqueTamanhos() != null) produto.setEstoqueTamanhos(dto.estoqueTamanhos());
        produto.recalcularEstoqueTotal();
        return ResponseEntity.ok(produtoRepository.save(produto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarProduto(@PathVariable Long id, @Valid @RequestBody CriarProdutoDTO dto) {
        return produtoRepository.findById(id).map(produto -> {
            produto.setNome(InputSanitizer.sanitizeText(dto.nome()));
            produto.setDescricao(dto.descricao() != null ? InputSanitizer.sanitizeHtml(dto.descricao()) : "");
            produto.setCategoria(InputSanitizer.sanitizeText(dto.categoria()));
            produto.setPreco(dto.preco());
            produto.setPrecoPromocional(dto.precoPromocional());
            if (!InputSanitizer.isValidUrl(dto.urlImagem())) {
                return ResponseEntity.badRequest().body((Object) Map.of("erro", "URL da imagem invalida."));
            }
            produto.setUrlImagem(dto.urlImagem());
            if (dto.imagens() != null) produto.setImagens(dto.imagens());
            if (dto.estoqueTamanhos() != null) produto.setEstoqueTamanhos(dto.estoqueTamanhos());
            return ResponseEntity.ok((Object) produtoRepository.save(produto));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id) {
        if (!produtoRepository.existsById(id)) return ResponseEntity.notFound().build();
        produtoRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private boolean isValidImageMagicBytes(byte[] header) {
        // JPEG: FF D8 FF
        if (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 && header[2] == (byte) 0xFF) return true;
        // PNG: 89 50 4E 47
        if (header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) return true;
        // GIF: 47 49 46 38
        if (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38) return true;
        // WebP: RIFF....WEBP
        if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
                && header.length >= 12 && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50) return true;
        // HEIC/HEIF: ....ftyp (offset 4)
        if (header.length >= 12 && header[4] == 0x66 && header[5] == 0x74 && header[6] == 0x79 && header[7] == 0x70) return true;
        return false;
    }
}
