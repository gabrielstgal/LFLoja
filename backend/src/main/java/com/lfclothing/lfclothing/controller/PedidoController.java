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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

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

        BigDecimal total = BigDecimal.ZERO;
        Pedido pedido = new Pedido(usuario, total, StatusPedido.PENDENTE);

        if (requisicao.rua() != null && !requisicao.rua().isEmpty()) {
            Endereco enderecoEntrega = new Endereco(usuario, requisicao.rua(), requisicao.numero(), requisicao.complemento(), requisicao.bairro(), requisicao.cidade(), requisicao.estado(), requisicao.cep());
            enderecoRepository.save(enderecoEntrega);
            pedido.setEnderecoEntrega(enderecoEntrega);
        }

        for (ItemPedidoRequisicao itemReq : requisicao.itens()) {
            Produto produto = produtoRepository.findById(itemReq.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto nao encontrado: " + itemReq.produtoId()));

            BigDecimal precoUnitario = (produto.getPrecoPromocional() != null && produto.getPrecoPromocional().compareTo(produto.getPreco()) < 0)
                    ? produto.getPrecoPromocional() : produto.getPreco();

            ItemPedido itemPedido = new ItemPedido(pedido, produto, itemReq.quantidade(), precoUnitario, itemReq.tamanho());
            pedido.adicionarItem(itemPedido);

            BigDecimal itemTotal = precoUnitario.multiply(BigDecimal.valueOf(itemReq.quantidade()));
            total = total.add(itemTotal);
        }

        // Aplicar cupom se fornecido
        BigDecimal valorDesconto = BigDecimal.ZERO;
        if (requisicao.cupom() != null && !requisicao.cupom().isBlank()) {
            var cupomOpt = cupomRepository.findByCodigoAndAtivoTrue(requisicao.cupom().toUpperCase().trim());
            if (cupomOpt.isPresent()) {
                Cupom cupom = cupomOpt.get();
                if (cupom.getTipo() == TipoCupom.PERCENTUAL) {
                    valorDesconto = total.multiply(cupom.getValor()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                } else {
                    valorDesconto = cupom.getValor().min(total);
                }
                pedido.setCupomCodigo(cupom.getCodigo());
                pedido.setValorDesconto(valorDesconto);
            }
        }

        pedido.setValorTotal(total.subtract(valorDesconto).max(BigDecimal.ZERO));
        pedidoRepository.saveAndFlush(pedido);

        return ResponseEntity.ok(java.util.Map.of(
                "id", pedido.getId(),
                "protocolo", pedido.getProtocolo(),
                "valorTotal", pedido.getValorTotal(),
                "status", pedido.getStatus().name()
        ));
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
    public ResponseEntity<List<Pedido>> todosPedidos() {
        return ResponseEntity.ok(pedidoRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "dataCriacao")));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> atualizarStatusPedido(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        Pedido pedido = pedidoRepository.findById(id).orElseThrow(() -> new RuntimeException("Pedido nao encontrado."));
        try {
            StatusPedido statusAnterior = pedido.getStatus();
            StatusPedido novoStatus = StatusPedido.valueOf(body.get("status"));

            // Ao confirmar pagamento (PENDENTE -> PAGO), desconta estoque por tamanho
            if (statusAnterior == StatusPedido.PENDENTE && novoStatus == StatusPedido.PAGO) {
                for (ItemPedido item : pedido.getItens()) {
                    Produto produto = produtoRepository.findByIdComLock(item.getProduto().getId())
                            .orElseThrow(() -> new RuntimeException("Produto nao encontrado."));

                    String tamanho = item.getTamanho();
                    if (tamanho != null && !tamanho.isBlank()) {
                        int disponivel = produto.getEstoqueTamanhos().getOrDefault(tamanho, 0);
                        if (disponivel < item.getQuantidade()) {
                            return ResponseEntity.badRequest()
                                    .body("Estoque insuficiente para: " + produto.getNome()
                                            + " (tam: " + tamanho + ", disponivel: " + disponivel
                                            + ", necessario: " + item.getQuantidade() + ")");
                        }
                        produto.getEstoqueTamanhos().put(tamanho, disponivel - item.getQuantidade());
                    }
                    produto.recalcularEstoqueTotal();
                    produtoRepository.save(produto);
                }
            }

            // Ao cancelar um pedido que ja foi pago, restaura estoque por tamanho
            if (statusAnterior == StatusPedido.PAGO && novoStatus == StatusPedido.CANCELADO) {
                for (ItemPedido item : pedido.getItens()) {
                    Produto produto = produtoRepository.findByIdComLock(item.getProduto().getId())
                            .orElseThrow(() -> new RuntimeException("Produto nao encontrado."));
                    String tamanho = item.getTamanho();
                    if (tamanho != null && !tamanho.isBlank()) {
                        int atual = produto.getEstoqueTamanhos().getOrDefault(tamanho, 0);
                        produto.getEstoqueTamanhos().put(tamanho, atual + item.getQuantidade());
                    }
                    produto.recalcularEstoqueTotal();
                    produtoRepository.save(produto);
                }
            }

            pedido.setStatus(novoStatus);
            pedidoRepository.save(pedido);
            return ResponseEntity.ok(pedido);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Status invalido.");
        }
    }
}
