package com.app.projettic.repository;

import com.app.projettic.domain.Projet;
import com.app.projettic.domain.enumeration.TypeCursus;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Projet entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProjetRepository extends JpaRepository<Projet, Long> {

    List<Projet> findByUserExtraId(Long userExtraId);
    Optional<Projet> findByGroupeId(Long groupeId);
    List<Projet> findByArchive(boolean archive);
    List<Projet> findByArchiveAndCursus(boolean archive, TypeCursus cursus);
}
