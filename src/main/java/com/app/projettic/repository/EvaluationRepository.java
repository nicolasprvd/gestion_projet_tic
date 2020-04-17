package com.app.projettic.repository;

import com.app.projettic.domain.Evaluation;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data  repository for the Evaluation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByActif(boolean actif);
}
