package com.app.projettic.service;

import com.app.projettic.service.dto.GroupeDTO;

import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.app.projettic.domain.Groupe}.
 */
public interface GroupeService {

    /**
     * Save a groupe.
     *
     * @param groupeDTO the entity to save.
     * @return the persisted entity.
     */
    GroupeDTO save(GroupeDTO groupeDTO);

    /**
     * Get all the groupes.
     *
     * @return the list of entities.
     */
    List<GroupeDTO> findAll();

    /**
     * Get the "id" groupe.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<GroupeDTO> findOne(Long id);

    /**
     * Get the "id" groupe.
     *
     * @param actif the actif of the groupe.
     * @return the entity.
     */
    List<GroupeDTO> findByActif(boolean actif);

    /**
     * Delete the "id" groupe.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Search for the groupe corresponding to the query.
     *
     * @param query the query of the search.
     *
     * @return the list of entities.
     */
    List<GroupeDTO> search(String query);
}
