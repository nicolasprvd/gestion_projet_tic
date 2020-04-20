package com.app.projettic.service;

import com.app.projettic.domain.Projet;
import com.app.projettic.service.dto.ProjetDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.app.projettic.domain.Projet}.
 */
public interface ProjetService {

    /**
     * Save a projet.
     *
     * @param projetDTO the entity to save.
     * @return the persisted entity.
     */
    ProjetDTO save(ProjetDTO projetDTO);

    /**
     * Get all the projets.
     *
     * @return the list of entities.
     */
    List<ProjetDTO> findAll();

    /**
     * Get the "id" projet.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ProjetDTO> findOne(Long id);

    /**
     * Get the "id" projet.
     *
     * @param archive the archive of the projet.
     * @return the entity.
     */
    List<ProjetDTO> findByArchive(boolean archive);

    /**
     * Delete the "id" projet.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Search for the projet corresponding to the query.
     *
     * @param query the query of the search.
     *
     * @return the list of entities.
     */
    List<ProjetDTO> search(String query);

    /**
     * Find projects by client id
     * @param userExtraId
     * @return
     */
    List<ProjetDTO> findByUserExtraId(Long userExtraId);

    /**
     * Find project by groupe id
     * @param groupeId
     * @return
     */
    Optional<ProjetDTO> findByGroupeId(Long groupeId);
}
