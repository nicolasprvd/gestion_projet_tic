package com.app.projettic.service.impl;

import com.app.projettic.service.EvaluationService;
import com.app.projettic.domain.Evaluation;
import com.app.projettic.repository.EvaluationRepository;
import com.app.projettic.repository.search.EvaluationSearchRepository;
import com.app.projettic.service.dto.EvaluationDTO;
import com.app.projettic.service.mapper.EvaluationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * Service Implementation for managing {@link Evaluation}.
 */
@Service
@Transactional
public class EvaluationServiceImpl implements EvaluationService {

    private final Logger log = LoggerFactory.getLogger(EvaluationServiceImpl.class);

    private final EvaluationRepository evaluationRepository;

    private final EvaluationMapper evaluationMapper;

    private final EvaluationSearchRepository evaluationSearchRepository;

    public EvaluationServiceImpl(EvaluationRepository evaluationRepository, EvaluationMapper evaluationMapper, EvaluationSearchRepository evaluationSearchRepository) {
        this.evaluationRepository = evaluationRepository;
        this.evaluationMapper = evaluationMapper;
        this.evaluationSearchRepository = evaluationSearchRepository;
    }

    /**
     * Save a evaluation.
     *
     * @param evaluationDTO the entity to save.
     * @return the persisted entity.
     */
    @Override
    public EvaluationDTO save(EvaluationDTO evaluationDTO) {
        log.debug("Request to save Evaluation : {}", evaluationDTO);
        Evaluation evaluation = evaluationMapper.toEntity(evaluationDTO);
        evaluation = evaluationRepository.save(evaluation);
        EvaluationDTO result = evaluationMapper.toDto(evaluation);
        evaluationSearchRepository.save(evaluation);
        return result;
    }

    /**
     * Get all the evaluations.
     *
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<EvaluationDTO> findAll() {
        log.debug("Request to get all Evaluations");
        return evaluationRepository.findAll().stream()
            .map(evaluationMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one evaluation by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<EvaluationDTO> findOne(Long id) {
        log.debug("Request to get Evaluation : {}", id);
        return evaluationRepository.findById(id)
            .map(evaluationMapper::toDto);
    }

    /**
     * Delete the evaluation by id.
     *
     * @param id the id of the entity.
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Evaluation : {}", id);
        evaluationRepository.deleteById(id);
        evaluationSearchRepository.deleteById(id);
    }

    /**
     * Search for the evaluation corresponding to the query.
     *
     * @param query the query of the search.
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<EvaluationDTO> search(String query) {
        log.debug("Request to search Evaluations for query {}", query);
        return StreamSupport
            .stream(evaluationSearchRepository.search(queryStringQuery(query)).spliterator(), false)
            .map(evaluationMapper::toDto)
            .collect(Collectors.toList());
    }
}
