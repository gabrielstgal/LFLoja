package com.lfclothing.lfclothing.repository;

import com.lfclothing.lfclothing.model.Produto;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    Page<Produto> findByCategoriaIn(List<String> categorias, Pageable pageable);

    @Query("SELECT p FROM Produto p WHERE LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR LOWER(p.descricao) LIKE LOWER(CONCAT('%', :termo, '%'))")
    Page<Produto> buscarPorTermo(@Param("termo") String termo, Pageable pageable);

    @Query("SELECT p FROM Produto p WHERE p.categoria IN :categorias AND (LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR LOWER(p.descricao) LIKE LOWER(CONCAT('%', :termo, '%')))")
    Page<Produto> buscarPorTermoECategorias(@Param("termo") String termo, @Param("categorias") List<String> categorias, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Produto p WHERE p.id = :id")
    Optional<Produto> findByIdComLock(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Produto p SET p.quantidadeEstoque = p.quantidadeEstoque + :quantidade WHERE p.id = :id")
    void restaurarEstoque(@Param("id") Long id, @Param("quantidade") int quantidade);

    @Query("SELECT p FROM Produto p WHERE p.codigo IS NULL OR p.codigo = ''")
    List<Produto> findSemCodigo();

    boolean existsByNomeContaining(String nome);
}
