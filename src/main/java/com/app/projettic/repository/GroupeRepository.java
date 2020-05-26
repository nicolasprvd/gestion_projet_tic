package com.app.projettic.repository;

import com.app.projettic.domain.Groupe;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Groupe entity.
 */
@SuppressWarnings("unused")
@Repository
public interface GroupeRepository extends JpaRepository<Groupe, Long> {
    List<Groupe> findByActif(boolean actif);
    List<Groupe> findByProjetId(Long projetId);
}
