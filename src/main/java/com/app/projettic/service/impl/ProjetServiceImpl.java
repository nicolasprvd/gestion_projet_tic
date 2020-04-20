package com.app.projettic.service.impl;

import com.app.projettic.service.ProjetService;
import com.app.projettic.domain.Projet;
import com.app.projettic.repository.ProjetRepository;
import com.app.projettic.repository.search.ProjetSearchRepository;
import com.app.projettic.service.dto.ProjetDTO;
import com.app.projettic.service.mapper.ProjetMapper;
import jdk.nashorn.internal.runtime.options.Option;
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
 * Service Implementation for managing {@link Projet}.
 */
@Service
@Transactional
public class ProjetServiceImpl implements ProjetService {

    private final Logger log = LoggerFactory.getLogger(ProjetServiceImpl.class);

    private final ProjetRepository projetRepository;

    private final ProjetMapper projetMapper;

    private final ProjetSearchRepository projetSearchRepository;

    public ProjetServiceImpl(ProjetRepository projetRepository, ProjetMapper projetMapper, ProjetSearchRepository projetSearchRepository) {
        this.projetRepository = projetRepository;
        this.projetMapper = projetMapper;
        this.projetSearchRepository = projetSearchRepository;
    }

    /**
     * Save a projet.
     *
     * @param projetDTO the entity to save.
     * @return the persisted entity.
     */
    @Override
    public ProjetDTO save(ProjetDTO projetDTO) {
        log.debug("Request to save Projet : {}", projetDTO);
        Projet projet = projetMapper.toEntity(projetDTO);
        projet = projetRepository.save(projet);
        ProjetDTO result = projetMapper.toDto(projet);
        projetSearchRepository.save(projet);
        return result;
    }

    /**
     * Get all the projets.
     *
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProjetDTO> findAll() {
        log.debug("Request to get all Projets");
        return projetRepository.findAll().stream()
            .map(projetMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one projet by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ProjetDTO> findOne(Long id) {
        log.debug("Request to get Projet : {}", id);
        return projetRepository.findById(id)
            .map(projetMapper::toDto);
    }

    /**
     * Delete the projet by id.
     *
     * @param id the id of the entity.
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Projet : {}", id);
        projetRepository.deleteById(id);
        projetSearchRepository.deleteById(id);
    }

    /**
     * Search for the projet corresponding to the query.
     *
     * @param query the query of the search.
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProjetDTO> search(String query) {
        log.debug("Request to search Projets for query {}", query);
        return StreamSupport
            .stream(projetSearchRepository.search(queryStringQuery(query)).spliterator(), false)
            .map(projetMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get all projects from client id
     * @param userExtraId
     * @return array list
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProjetDTO> findByUserExtraId(Long userExtraId) {
        log.debug("Request to search projects from client id {}", userExtraId);
        return projetRepository.findByUserExtraId(userExtraId)
            .stream()
            .map(projetMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get project from group id
     * @param groupeId
     * @return object projet
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<ProjetDTO> findByGroupeId(Long groupeId) {
        log.debug("Request to get Projet from group id : {}", groupeId);
        return projetRepository.findByGroupeId(groupeId).map(projetMapper::toDto);
    }
}
