package com.lfclothing.lfclothing.repository;

import com.lfclothing.lfclothing.model.Cupom;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CupomRepository extends JpaRepository<Cupom, Long> {
    Optional<Cupom> findByCodigoAndAtivoTrue(String codigo);
    boolean existsByCodigo(String codigo);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Cupom c WHERE c.codigo = :codigo AND c.ativo = true")
    Optional<Cupom> findByCodigoAndAtivoTrueForUpdate(@Param("codigo") String codigo);
}
