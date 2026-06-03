package com.lfclothing.lfclothing.repository;

import com.lfclothing.lfclothing.model.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Pedido p " +
           "JOIN p.itens i WHERE p.usuario.id = :usuarioId AND i.produto.id = :produtoId " +
           "AND p.status IN (com.lfclothing.lfclothing.model.StatusPedido.PAGO, " +
           "com.lfclothing.lfclothing.model.StatusPedido.ENVIADO, " +
           "com.lfclothing.lfclothing.model.StatusPedido.ENTREGUE)")
    boolean existsByUsuarioIdAndProdutoId(@Param("usuarioId") Long usuarioId, @Param("produtoId") Long produtoId);
}
