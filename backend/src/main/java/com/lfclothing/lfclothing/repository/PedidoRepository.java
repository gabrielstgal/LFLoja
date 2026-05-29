package com.lfclothing.lfclothing.repository;

import com.lfclothing.lfclothing.model.Pedido;
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

    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.enderecoEntrega " +
           "ORDER BY p.dataCriacao DESC")
    List<Pedido> findAllWithDetails();

    @Query("SELECT p FROM Pedido p " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.enderecoEntrega " +
           "WHERE p.id = :id")
    Optional<Pedido> findByIdWithDetails(@Param("id") Long id);
}
