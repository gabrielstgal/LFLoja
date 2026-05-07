package com.lfclothing.lfclothing.repository;

import com.lfclothing.lfclothing.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findAllByOrderByOrdemAsc();
    boolean existsByNome(String nome);
}
