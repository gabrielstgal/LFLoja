package com.lfclothing.lfclothing.service;

import com.lfclothing.lfclothing.model.ItemPedido;
import com.lfclothing.lfclothing.model.Pedido;
import com.lfclothing.lfclothing.model.Produto;
import com.lfclothing.lfclothing.model.StatusPedido;
import com.lfclothing.lfclothing.repository.PedidoRepository;
import com.lfclothing.lfclothing.repository.ProdutoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Centraliza a baixa/restauracao de estoque e a confirmacao de pagamento.
 * A logica de estoque era inline no PedidoController; foi extraida para ser
 * reutilizada pela confirmacao automatica (polling/webhook AbacatePay) e pela
 * transicao manual de status feita pelo admin — sem duplicacao.
 */
@Service
public class PedidoPagamentoService {

    private static final Logger log = LoggerFactory.getLogger(PedidoPagamentoService.class);

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;

    public PedidoPagamentoService(PedidoRepository pedidoRepository, ProdutoRepository produtoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
    }

    /**
     * Confirma o pagamento de um pedido de forma idempotente. Bloqueia a linha
     * do pedido (FOR UPDATE) para que chamadas concorrentes (polling + webhook)
     * nao descontem estoque em duplicidade: a primeira transita PENDENTE->PAGO,
     * as demais veem status != PENDENTE e nao fazem nada.
     */
    @Transactional
    public void confirmarPagamento(Long pedidoId) {
        Pedido pedido = pedidoRepository.findByIdForUpdate(pedidoId).orElse(null);
        if (pedido == null) {
            log.warn("confirmarPagamento: pedido {} nao encontrado", pedidoId);
            return;
        }
        if (pedido.getStatus() != StatusPedido.PENDENTE) {
            log.info("confirmarPagamento: pedido {} ja processado (status {})", pedidoId, pedido.getStatus());
            return;
        }

        String erro = descontarEstoque(pedido);
        if (erro != null) {
            // Pagamento ja foi recebido: nao podemos abortar. Marca PAGO e alerta
            // para ajuste manual de estoque.
            log.error("CRITICO: pagamento confirmado mas estoque insuficiente no pedido {} ({}). "
                    + "Pedido marcado como PAGO; ajustar estoque manualmente.", pedidoId, erro);
        }
        pedido.setStatus(StatusPedido.PAGO);
        pedidoRepository.save(pedido);
        log.info("Pedido {} confirmado como PAGO", pedidoId);
    }

    /**
     * Desconta o estoque dos itens do pedido (com lock por produto).
     * @return null em caso de sucesso, ou uma mensagem de erro se faltar estoque.
     */
    public String descontarEstoque(Pedido pedido) {
        for (ItemPedido item : pedido.getItens()) {
            Produto produto = produtoRepository.findByIdComLock(item.getProduto().getId()).orElse(null);
            if (produto == null) {
                return "Produto nao encontrado: " + item.getProduto().getId();
            }

            String tamanho = item.getTamanho();
            boolean temTamanhos = produto.getEstoqueTamanhos() != null && !produto.getEstoqueTamanhos().isEmpty();

            if (temTamanhos && tamanho != null && !tamanho.isBlank()) {
                int disponivel = produto.getEstoqueTamanhos().getOrDefault(tamanho, 0);
                if (disponivel < item.getQuantidade()) {
                    return "Estoque insuficiente para: " + produto.getNome()
                            + " (tam: " + tamanho + ", disponivel: " + disponivel
                            + ", necessario: " + item.getQuantidade() + ")";
                }
                produto.getEstoqueTamanhos().put(tamanho, disponivel - item.getQuantidade());
                produto.recalcularEstoqueTotal();
            } else if (!temTamanhos) {
                int estoqueAtual = produto.getQuantidadeEstoque();
                if (estoqueAtual < item.getQuantidade()) {
                    return "Estoque insuficiente para: " + produto.getNome()
                            + " (disponivel: " + estoqueAtual
                            + ", necessario: " + item.getQuantidade() + ")";
                }
                produto.setQuantidadeEstoque(estoqueAtual - item.getQuantidade());
            }

            produtoRepository.save(produto);
        }
        return null;
    }

    /**
     * Restaura o estoque dos itens do pedido (ao cancelar um pedido pago/enviado).
     */
    public void restaurarEstoque(Pedido pedido) {
        for (ItemPedido item : pedido.getItens()) {
            Produto produto = produtoRepository.findByIdComLock(item.getProduto().getId()).orElse(null);
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
}
