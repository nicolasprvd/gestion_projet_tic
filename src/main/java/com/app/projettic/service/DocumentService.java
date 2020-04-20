package com.app.projettic.service;

import com.app.projettic.service.dto.DocumentDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.app.projettic.domain.Document}.
 */
public interface DocumentService {

    /**
     * Save a document.
     *
     * @param documentDTO the entity to save.
     * @return the persisted entity.
     */
    DocumentDTO save(DocumentDTO documentDTO);

    /**
     * Get all the documents.
     *
     * @return the list of entities.
     */
    List<DocumentDTO> findAll();

    /**
     * Get the "id" document.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<DocumentDTO> findOne(Long id);

    /**
     * Get the "id" document.
     *
     * @param actif the actif of the document.
     * @return the entity.
     */
    List<DocumentDTO> findByActif(boolean actif);

    /**
     * Get the "id" documents.
     *
     * @param projetId the id of the project.
     * @return the entity.
     */
    List<DocumentDTO> findByProjetId(Long projetId);

    /**
     * Delete the "id" document.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Search for the document corresponding to the query.
     *
     * @param query the query of the search.
     *
     * @return the list of entities.
     */
    List<DocumentDTO> search(String query);
}
