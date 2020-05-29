package com.app.projettic.repository;

import com.app.projettic.domain.Evaluation;

import com.app.projettic.domain.Projet;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Evaluation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByActif(boolean actif);

    @Query("SELECT e FROM Evaluation e INNER JOIN UserExtra ue ON ue.evaluation.id = e.id INNER JOIN Groupe g ON g.id = ue.groupe.id WHERE g.projet.id = ?1")
    Optional<Evaluation> findByProjet(Long projet);
}
