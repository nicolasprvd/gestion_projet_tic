package com.app.projettic.web.rest;

import com.app.projettic.service.UserExtraService;
import com.app.projettic.web.rest.errors.BadRequestAlertException;
import com.app.projettic.service.dto.UserExtraDTO;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing {@link com.app.projettic.domain.UserExtra}.
 */
@RestController
@RequestMapping("/api")
public class UserExtraResource {

    private final Logger log = LoggerFactory.getLogger(UserExtraResource.class);

    private static final String ENTITY_NAME = "userExtra";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final UserExtraService userExtraService;

    public UserExtraResource(UserExtraService userExtraService) {
        this.userExtraService = userExtraService;
    }

    /**
     * {@code POST  /user-extras} : Create a new userExtra.
     *
     * @param userExtraDTO the userExtraDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new userExtraDTO, or with status {@code 400 (Bad Request)} if the userExtra has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/user-extras")
    public ResponseEntity<UserExtraDTO> createUserExtra(@RequestBody UserExtraDTO userExtraDTO) throws URISyntaxException {
        log.debug("REST request to save UserExtra : {}", userExtraDTO);
        if (userExtraDTO.getId() != null) {
            throw new BadRequestAlertException("A new userExtra cannot already have an ID", ENTITY_NAME, "idexists");
        }
        UserExtraDTO result = userExtraService.save(userExtraDTO);
        return ResponseEntity.created(new URI("/api/user-extras/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /user-extras} : Updates an existing userExtra.
     *
     * @param userExtraDTO the userExtraDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userExtraDTO,
     * or with status {@code 400 (Bad Request)} if the userExtraDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the userExtraDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/user-extras")
    public ResponseEntity<UserExtraDTO> updateUserExtra(@RequestBody UserExtraDTO userExtraDTO) throws URISyntaxException {
        log.debug("REST request to update UserExtra : {}", userExtraDTO);
        if (userExtraDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        UserExtraDTO result = userExtraService.save(userExtraDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userExtraDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /user-extras} : get all the userExtras.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of userExtras in body.
     */
    @GetMapping("/user-extras")
    public List<UserExtraDTO> getAllUserExtras() {
        log.debug("REST request to get all UserExtras");
        return userExtraService.findAll();
    }

    /**
     * {@code GET  /user-extras/:id} : get the "id" userExtra.
     *
     * @param id the id of the userExtraDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the userExtraDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/user-extras/{id}")
    public ResponseEntity<UserExtraDTO> getUserExtra(@PathVariable Long id) {
        log.debug("REST request to get UserExtra : {}", id);
        Optional<UserExtraDTO> userExtraDTO = userExtraService.findOne(id);
        return ResponseUtil.wrapOrNotFound(userExtraDTO);
    }

    /**
     * {@code DELETE  /user-extras/:id} : delete the "id" userExtra.
     *
     * @param id the id of the userExtraDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/user-extras/{id}")
    public ResponseEntity<Void> deleteUserExtra(@PathVariable Long id) {
        log.debug("REST request to delete UserExtra : {}", id);
        userExtraService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString())).build();
    }

    /**
     * {@code SEARCH  /_search/user-extras?query=:query} : search for the userExtra corresponding
     * to the query.
     *
     * @param query the query of the userExtra search.
     * @return the result of the search.
     */
    @GetMapping("/_search/user-extras")
    public List<UserExtraDTO> searchUserExtras(@RequestParam String query) {
        log.debug("REST request to search UserExtras for query {}", query);
        return userExtraService.search(query);
    }

    /**
     * {@code GET  /user-extras/actif} : get all the user-extras with the actif status.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of userextra in body.
     */
    @GetMapping("/user-extras/actif/{actif}")
    public List<UserExtraDTO> findByActif(@PathVariable boolean actif) {
        log.debug("REST request to get all User-extras");
        return userExtraService.findByActif(actif);
    }
}
