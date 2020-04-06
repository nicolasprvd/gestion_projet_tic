package com.app.projettic.service.impl;

import com.app.projettic.service.GroupeService;
import com.app.projettic.domain.Groupe;
import com.app.projettic.repository.GroupeRepository;
import com.app.projettic.repository.search.GroupeSearchRepository;
import com.app.projettic.service.dto.GroupeDTO;
import com.app.projettic.service.mapper.GroupeMapper;
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
 * Service Implementation for managing {@link Groupe}.
 */
@Service
@Transactional
public class GroupeServiceImpl implements GroupeService {

    private final Logger log = LoggerFactory.getLogger(GroupeServiceImpl.class);

    private final GroupeRepository groupeRepository;

    private final GroupeMapper groupeMapper;

    private final GroupeSearchRepository groupeSearchRepository;

    public GroupeServiceImpl(GroupeRepository groupeRepository, GroupeMapper groupeMapper, GroupeSearchRepository groupeSearchRepository) {
        this.groupeRepository = groupeRepository;
        this.groupeMapper = groupeMapper;
        this.groupeSearchRepository = groupeSearchRepository;
    }

    /**
     * Save a groupe.
     *
     * @param groupeDTO the entity to save.
     * @return the persisted entity.
     */
    @Override
    public GroupeDTO save(GroupeDTO groupeDTO) {
        log.debug("Request to save Groupe : {}", groupeDTO);
        Groupe groupe = groupeMapper.toEntity(groupeDTO);
        groupe = groupeRepository.save(groupe);
        GroupeDTO result = groupeMapper.toDto(groupe);
        groupeSearchRepository.save(groupe);
        return result;
    }

    /**
     * Get all the groupes.
     *
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<GroupeDTO> findAll() {
        log.debug("Request to get all Groupes");
        return groupeRepository.findAll().stream()
            .map(groupeMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one groupe by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<GroupeDTO> findOne(Long id) {
        log.debug("Request to get Groupe : {}", id);
        return groupeRepository.findById(id)
            .map(groupeMapper::toDto);
    }

    /**
     * Delete the groupe by id.
     *
     * @param id the id of the entity.
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete Groupe : {}", id);
        groupeRepository.deleteById(id);
        groupeSearchRepository.deleteById(id);
    }

    /**
     * Search for the groupe corresponding to the query.
     *
     * @param query the query of the search.
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<GroupeDTO> search(String query) {
        log.debug("Request to search Groupes for query {}", query);
        return StreamSupport
            .stream(groupeSearchRepository.search(queryStringQuery(query)).spliterator(), false)
            .map(groupeMapper::toDto)
            .collect(Collectors.toList());
    }
}
