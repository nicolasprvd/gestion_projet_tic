package com.app.projettic.service.impl;

import com.app.projettic.service.UserExtraService;
import com.app.projettic.domain.UserExtra;
import com.app.projettic.repository.UserExtraRepository;
import com.app.projettic.repository.search.UserExtraSearchRepository;
import com.app.projettic.service.dto.UserExtraDTO;
import com.app.projettic.service.mapper.UserExtraMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * Service Implementation for managing {@link UserExtra}.
 */
@Service
@Transactional
public class UserExtraServiceImpl implements UserExtraService {

    private final Logger log = LoggerFactory.getLogger(UserExtraServiceImpl.class);

    private final UserExtraRepository userExtraRepository;

    private final UserExtraMapper userExtraMapper;

    private final UserExtraSearchRepository userExtraSearchRepository;

    public UserExtraServiceImpl(UserExtraRepository userExtraRepository, UserExtraMapper userExtraMapper, UserExtraSearchRepository userExtraSearchRepository) {
        this.userExtraRepository = userExtraRepository;
        this.userExtraMapper = userExtraMapper;
        this.userExtraSearchRepository = userExtraSearchRepository;
    }

    /**
     * Save a userExtra.
     *
     * @param userExtraDTO the entity to save.
     * @return the persisted entity.
     */
    @Override
    public UserExtraDTO save(UserExtraDTO userExtraDTO) {
        log.debug("Request to save UserExtra : {}", userExtraDTO);
        UserExtra userExtra = userExtraMapper.toEntity(userExtraDTO);
        userExtra = userExtraRepository.save(userExtra);
        UserExtraDTO result = userExtraMapper.toDto(userExtra);
        userExtraSearchRepository.save(userExtra);
        return result;
    }

    /**
     * Get all the userExtras.
     *
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserExtraDTO> findAll() {
        log.debug("Request to get all UserExtras");
        return userExtraRepository.findAll().stream()
            .map(userExtraMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one userExtra by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<UserExtraDTO> findOne(Long id) {
        log.debug("Request to get UserExtra : {}", id);
        return userExtraRepository.findById(id)
            .map(userExtraMapper::toDto);
    }

    /**
     * Delete the userExtra by id.
     *
     * @param id the id of the entity.
     */
    @Override
    public void delete(Long id) {
        log.debug("Request to delete UserExtra : {}", id);
        userExtraRepository.deleteById(id);
        userExtraSearchRepository.deleteById(id);
    }

    /**
     * Search for the userExtra corresponding to the query.
     *
     * @param query the query of the search.
     * @return the list of entities.
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserExtraDTO> search(String query) {
        log.debug("Request to search UserExtras for query {}", query);
        return StreamSupport
            .stream(userExtraSearchRepository.search(queryStringQuery(query)).spliterator(), false)
            .map(userExtraMapper::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get all user from groupe id
     * @param groupeId
     * @return list user dto
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserExtraDTO> findByGroupeId(Long groupeId) {
        log.debug("Request to get all UserExtras from groupe id = " + groupeId);
        return userExtraRepository.findByGroupeId(groupeId)
            .stream()
            .map(userExtraMapper::toDto)
            .collect(Collectors.toList());
    }
}
