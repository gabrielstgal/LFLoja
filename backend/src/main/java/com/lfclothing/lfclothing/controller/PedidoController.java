package com.lfclothing.lfclothing.controller;

import com.lfclothing.lfclothing.dto.ItemPedidoRequisicao;
import com.lfclothing.lfclothing.dto.PedidoRequisicao;
import com.lfclothing.lfclothing.model.*;
import com.lfclothing.lfclothing.repository.PedidoRepository;
import com.lfclothing.lfclothing.repository.ProdutoRepository;
import com.lfclothing.lfclothing.repository.UsuarioRepository;
import com.lfclothing.lfclothing.repository.EnderecoRepository;
import com.lfclothing.lfclothing.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.lfclothing.lfclothing.security.InputSanitizer;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EnderecoRepository enderecoRepository;
    private final com.lfclothing.lfclothing.repository.CupomRepository cupomRepository;

    public PedidoController(PedidoRepository pedidoRepository, ProdutoRepository produtoRepository, UsuarioRepository usuarioRepository, EnderecoRepository enderecoRepository, com.lfclothing.lfclothing.repository.CupomRepository cupomRepository) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
        this.enderecoRepository = enderecoRepository;
        this.cupomRepository = cupomRepository;
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkout(@Valid @RequestBody PedidoRequisicao requisicao, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Usuario usuario = usuarioRepository.findById(userDetails.getId()).orElseThrow();

        if (requisicao.itens().size() > 50) {
            return ResponseEntity.badRequest().body("Maximo de 50 itens por pedido.");
        }

        BigDecimal total = BigDecimal.ZERO;
        Pedido pedido = new Pedido(usuario, total, StatusPedido.PENDENTE);

        if (requisicao.rua() != null && !requisicao.rua().isEmpty()) {
            Endereco enderecoEntrega = new Endereco(usuario,
                    InputSanitizer.sanitizeText(requisicao.rua()),
                    InputSanitizer.sanitizeText(requisicao.numero()),
                    InputSanitizer.sanitizeText(requisicao.complemento()),
                    InputSanitizer.sanitizeText(requisicao.bairro()),
                    InputSanitizer.sanitizeText(requisicao.cidade()),
                    InputSanitizer.sanitizeText(requisicao.estado()),
                    InputSanitizer.sanitizeText(requisicao.cep()));
            enderecoRepository.save(enderecoEntrega);
            pedido.setEnderecoEntrega(enderecoEntrega);
        }

        for (ItemPedidoRequisicao itemReq : requisicao.itens()) {
            int quantidade = InputSanitizer.clampQuantity(itemReq.quantidade(), 99);
            Produto produto = produtoRepository.findById(itemReq.produtoId())
                    .orElse(null);

            if (produto == null) {
                return ResponseEntity.badRequest().body("Produto nao encontrado. Atualize seu carrinho.");
            }

            // Validar estoque no checkout
            String tamanho = itemReq.tamanho();
            boolean temTamanhos = produto.getEstoqueTamanhos() != null && !produto.getEstoqueTamanhos().isEmpty();

            if (temTamanhos) {
                if (tamanho == null || tamanho.isBlank()) {
                    return ResponseEntity.badRequest().body("Selecione um tamanho para: " + produto.getNome());
                }
                int disponivel = produto.getEstoqueTamanhos().getOrDefault(tamanho, 0);
                if (disponivel < quantidade) {
                    return ResponseEntity.badRequest().body(
                            "Estoque insuficiente para " + produto.getNome() + " no tamanho " + tamanho + ".");
                }
            } else {
                if (produto.getQuantidadeEstoque() < quantidade) {
                    return ResponseEntity.badRequest().body(
                            "Estoque insuficiente para " + produto.getNome() + ".");
                }
            }

            BigDecimal precoUnitario = (produto.getPrecoPromocional() != null && produto.getPrecoPromocional().compareTo(produto.getPreco()) < 0)
                    ? produto.getPrecoPromocional() : produto.getPreco();

            ItemPedido itemPedido = new ItemPedido(pedido, produto, quantidade, precoUnitario, tamanho);
            pedido.adicionarItem(itemPedido);

            BigDecimal itemTotal = precoUnitario.multiply(BigDecimal.valueOf(quantidade));
            total = total.add(itemTotal);
        }

        // Aplicar cupom se fornecido
        BigDecimal valorDesconto = BigDecimal.ZERO;
        String cupomStatus = null;
        if (requisicao.cupom() != null && !requisicao.cupom().isBlank()) {
            var cupomOpt = cupomRepository.findByCodigoAndAtivoTrueForUpdate(requisicao.cupom().toUpperCase().trim());
            if (cupomOpt.isPresent() && cupomOpt.get().isValido()) {
                Cupom cupom = cupomOpt.get();
                if (cupom.getTipo() == TipoCupom.PERCENTUAL) {
                    valorDesconto = total.multiply(cupom.getValor()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                } else {
                    valorDesconto = cupom.getValor().min(total);
                }
                pedido.setCupomCodigo(cupom.getCodigo());
                pedido.setValorDesconto(valorDesconto);
                cupom.incrementarUso();
                cupomRepository.save(cupom);
                cupomStatus = "APLICADO";
            } else {
                cupomStatus = "INVALIDO";
            }
        }

        pedido.setValorTotal(total.subtract(valorDesconto).max(BigDecimal.ZERO));

        pedidoRepository.saveAndFlush(pedido);

        var response = new java.util.LinkedHashMap<String, Object>();
        response.put("id", pedido.getId());
        response.put("protocolo", pedido.getProtocolo());
        response.put("valorTotal", pedido.getValorTotal());
        response.put("status", pedido.getStatus().name());
        if (cupomStatus != null) {
            response.put("cupomStatus", cupomStatus);
        }

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/meus")
    public ResponseEntity<List<Pedido>> meusPedidos(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Pedido> pedidos = pedidoRepository.findByUsuarioId(userDetails.getId());
        return ResponseEntity.ok(pedidos);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/todos")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<Pedido>> todosPedidos(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamanho) {
        int tamanhoPaginacao = Math.min(tamanho, 200);
        Pageable pageable = PageRequest.of(pagina, tamanhoPaginacao, Sort.by(Sort.Direction.DESC, "dataCriacao"));
        return ResponseEntity.ok(pedidoRepository.findAllWithDetails(pageable));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> atualizarStatusPedido(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Pedido pedido = pedidoRepository.findByIdWithDetails(id).orElse(null);
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }

        StatusPedido statusAnterior = pedido.getStatus();
        StatusPedido novoStatus;
        try {
            novoStatus = StatusPedido.valueOf(body.get("status"));
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body("Status invalido.");
        }

        // Validar transicao de status
        if (!statusAnterior.podeTransicionar(novoStatus)) {
            return ResponseEntity.badRequest().body(
                    "Transicao nao permitida: " + statusAnterior + " -> " + novoStatus + ".");
        }

        // Ao confirmar pagamento (PENDENTE -> PAGO), desconta estoque
        if (statusAnterior == StatusPedido.PENDENTE && novoStatus == StatusPedido.PAGO) {
            for (ItemPedido item : pedido.getItens()) {
                Produto produto = produtoRepository.findByIdComLock(item.getProduto().getId())
                        .orElse(null);
                if (produto == null) {
                    return ResponseEntity.badRequest().body("Produto nao encontrado: " + item.getProduto().getId());
                }

                String tamanho = item.getTamanho();
                boolean temTamanhos = produto.getEstoqueTamanhos() != null && !produto.getEstoqueTamanhos().isEmpty();

                if (temTamanhos && tamanho != null && !tamanho.isBlank()) {
                    int disponivel = produto.getEstoqueTamanhos().getOrDefault(tamanho, 0);
                    if (disponivel < item.getQuantidade()) {
                        return ResponseEntity.badRequest()
                                .body("Estoque insuficiente para: " + produto.getNome()
                                        + " (tam: " + tamanho + ", disponivel: " + disponivel
                                        + ", necessario: " + item.getQuantidade() + ")");
                    }
                    produto.getEstoqueTamanhos().put(tamanho, disponivel - item.getQuantidade());
                    produto.recalcularEstoqueTotal();
                } else if (!temTamanhos) {
                    int estoqueAtual = produto.getQuantidadeEstoque();
                    if (estoqueAtual < item.getQuantidade()) {
                        return ResponseEntity.badRequest()
                                .body("Estoque insuficiente para: " + produto.getNome()
                                        + " (disponivel: " + estoqueAtual
                                        + ", necessario: " + item.getQuantidade() + ")");
                    }
                    produto.setQuantidadeEstoque(estoqueAtual - item.getQuantidade());
                }

                produtoRepository.save(produto);
            }
        }

        // Ao cancelar um pedido pago ou enviado, restaura estoque
        if ((statusAnterior == StatusPedido.PAGO || statusAnterior == StatusPedido.ENVIADO)
                && novoStatus == StatusPedido.CANCELADO) {
            for (ItemPedido item : pedido.getItens()) {
                Produto produto = produtoRepository.findByIdComLock(item.getProduto().getId())
                        .orElse(null);
                if (produto == null) continue;

                String tamanho = item.getTamanho();
                boolean temTamanhos = produto.getEstoqueTamanhos() != null && !produto.getEstoqueTamanhos().isEmpty();

                if (temTamanhos && tamanho != null && !tamanho.isBlank()) {
                    int atual = produto.getEstoqueTamanhos().getOrDefault(tamanho, 0);
                    produto.getEstoqueTamanhos().put(tamanho, atual + item.getQuantidade());
                    produto.recalcularEstoqueTotal();
                } else if (!temTamanhos) {
                    produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() + item.getQuantidade());
                }

                produtoRepository.save(produto);
            }
        }

        pedido.setStatus(novoStatus);
        pedidoRepository.save(pedido);
        return ResponseEntity.ok(pedido);
    }
}
