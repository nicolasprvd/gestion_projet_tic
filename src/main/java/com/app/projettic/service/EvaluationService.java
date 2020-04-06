package com.app.projettic.service;

import com.app.projettic.service.dto.EvaluationDTO;

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
