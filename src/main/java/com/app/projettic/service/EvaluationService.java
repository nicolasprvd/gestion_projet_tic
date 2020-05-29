package com.app.projettic.service;

import com.app.projettic.domain.Projet;
import com.app.projettic.service.dto.EvaluationDTO;
import com.app.projettic.service.dto.ProjetDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.app.projettic.domain.Evaluation}.
 */
public interface EvaluationService {

    /**
     * Save a evaluation.
     *
     * @param evaluationDTO the entity to save.
     * @return the persisted entity.
     */
    EvaluationDTO save(EvaluationDTO evaluationDTO);

    /**
     * Get all the evaluations.
     *
     * @return the list of entities.
     */
    List<EvaluationDTO> findAll();

    /**
     * Get the "id" evaluation.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<EvaluationDTO> findOne(Long id);

    /**
     * Get the "id" evaluation.
     *
     * @param actif the actif of the evaluation.
     * @return the entity.
     */
    List<EvaluationDTO> findByActif(boolean actif);

    /**
     * Get the "id" evaluation.
     *
     * @param projet the projet of the evaluation.
     * @return the entity.
     */
    Optional<EvaluationDTO> findByProjet(Long projet);

    /**
     * Delete the "id" evaluation.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Search for the evaluation corresponding to the query.
     *
     * @param query the query of the search.
     *
     * @return the list of entities.
     */
    List<EvaluationDTO> search(String query);
}
