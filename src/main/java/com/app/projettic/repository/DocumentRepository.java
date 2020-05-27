package com.app.projettic.repository;

import com.app.projettic.domain.Document;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Document entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    Optional<Document> findByProjetId(Long projetId);
    List<Document> findByActif(boolean actif);
}
