package com.lfclothing.lfclothing.repository;

import com.lfclothing.lfclothing.model.Pedido;
import com.lfclothing.lfclothing.model.StatusPedido;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.enderecoEntrega " +
           "WHERE p.usuario.id = :usuarioId " +
           "ORDER BY p.dataCriacao DESC")
    List<Pedido> findByUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query(value = "SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.enderecoEntrega",
           countQuery = "SELECT COUNT(p) FROM Pedido p")
    Page<Pedido> findAllWithDetails(Pageable pageable);

    @Query("SELECT p FROM Pedido p " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.enderecoEntrega " +
           "WHERE p.id = :id")
    Optional<Pedido> findByIdWithDetails(@Param("id") Long id);

    /**
     * Bloqueia a linha do pedido (FOR UPDATE) para serializar a confirmacao de
     * pagamento — evita que webhook e polling descontem estoque em duplicidade.
     * Os itens sao carregados lazy dentro da mesma transacao.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pedido p WHERE p.id = :id")
    Optional<Pedido> findByIdForUpdate(@Param("id") Long id);

    /** Reconciliacao por id da cobranca AbacatePay (fallback do webhook). */
    Optional<Pedido> findByPagamentoId(String pagamentoId);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Pedido p " +
           "JOIN p.itens i WHERE p.usuario.id = :usuarioId AND i.produto.id = :produtoId " +
           "AND p.status IN :statuses")
    boolean existsByUsuarioIdAndProdutoIdAndStatusIn(
            @Param("usuarioId") Long usuarioId,
            @Param("produtoId") Long produtoId,
            @Param("statuses") java.util.Collection<StatusPedido> statuses);
}
