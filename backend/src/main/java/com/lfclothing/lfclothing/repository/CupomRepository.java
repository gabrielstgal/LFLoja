package com.lfclothing.lfclothing.repository;

import com.lfclothing.lfclothing.model.Cupom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CupomRepository extends JpaRepository<Cupom, Long> {
    Optional<Cupom> findByCodigoAndAtivoTrue(String codigo);
    boolean existsByCodigo(String codigo);
}
