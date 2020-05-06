package com.app.projettic.web.rest;
import com.app.projettic.domain.enumeration.TypeCursus;
import com.app.projettic.service.MailService;
import com.app.projettic.service.ProjetService;
import com.app.projettic.web.rest.errors.BadRequestAlertException;
import com.app.projettic.service.dto.ProjetDTO;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing {@link com.app.projettic.domain.Projet}.
 */
@RestController
@RequestMapping("/api")
public class ProjetResource {

    private final Logger log = LoggerFactory.getLogger(ProjetResource.class);

    private static final String ENTITY_NAME = "projet";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ProjetService projetService;

    private final MailService mailService;

    public ProjetResource(ProjetService projetService, MailService mailService) {
        this.projetService = projetService;
        this.mailService = mailService;
    }

    /**
     * {@code POST  /projets} : Create a new projet.
     *
     * @param projetDTO the projetDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new projetDTO, or with status {@code 400 (Bad Request)} if the projet has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/projets")
    public ResponseEntity<ProjetDTO> createProjet(@Valid @RequestBody ProjetDTO projetDTO) throws URISyntaxException {
        log.debug("REST request to save Projet : {}", projetDTO);
        if (projetDTO.getId() != null) {
            throw new BadRequestAlertException("A new projet cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProjetDTO result = projetService.save(projetDTO);
        return ResponseEntity.created(new URI("/api/projets/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /projets} : Updates an existing projet.
     *
     * @param projetDTO the projetDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated projetDTO,
     * or with status {@code 400 (Bad Request)} if the projetDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the projetDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/projets")
    public ResponseEntity<ProjetDTO> updateProjet(@Valid @RequestBody ProjetDTO projetDTO) throws URISyntaxException {
        log.debug("REST request to update Projet : {}", projetDTO);
        if (projetDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        ProjetDTO result = projetService.save(projetDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, projetDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /projets} : get all the projets.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of projets in body.
     */
    @GetMapping("/projets")
    public List<ProjetDTO> getAllProjets() {
        log.debug("REST request to get all Projets");
        return projetService.findAll();
    }

    /**
     * {@code GET  /projets/:id} : get the "id" projet.
     *
     * @param id the id of the projetDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the projetDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/projets/{id}")
    public ResponseEntity<ProjetDTO> getProjet(@PathVariable Long id) {
        log.debug("REST request to get Projet : {}", id);
        Optional<ProjetDTO> projetDTO = projetService.findOne(id);
        return ResponseUtil.wrapOrNotFound(projetDTO);
    }

    /**
     * {@code DELETE  /projets/:id} : delete the "id" projet.
     *
     * @param id the id of the projetDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/projets/{id}")
    public ResponseEntity<Void> deleteProjet(@PathVariable Long id) {
        log.debug("REST request to delete Projet : {}", id);
        projetService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString())).build();
    }

    /**
     * {@code SEARCH  /_search/projets?query=:query} : search for the projet corresponding
     * to the query.
     *
     * @param query the query of the projet search.
     * @return the result of the search.
     */
    @GetMapping("/_search/projets")
    public List<ProjetDTO> searchProjets(@RequestParam String query) {
        log.debug("REST request to search Projets for query {}", query);
        return projetService.search(query);
    }

    /**
     * {@code GET  /projets/client/:userExtraId} : get the "userExtraId" projets.
     *
     * @param userExtraId the id of the client to retrieve.
     * @return array list projet dto
     */
    @GetMapping("/projets/client/{userExtraId}")
    public List<ProjetDTO> findByUserExtraId(@PathVariable Long userExtraId) {
        log.debug("REST request to search Projets for client id {}", userExtraId);
        return projetService.findByUserExtraId(userExtraId);
    }

    /**
     * {@code GET  /projets/groupe/:groupeId} : get the "groupeId" projets.
     *
     * @param groupeId the id of the groupe to retrieve.
     * @return object projet dto
     */
    @GetMapping("/projets/groupe/{groupeId}")
    public Optional<ProjetDTO> findByGroupeId(@PathVariable Long groupeId) {
        log.debug("REST request to get Projet from groupe id : {}", groupeId);
        return projetService.findByGroupeId(groupeId);
    }
    /**
     * {@code SEND EMAIL  /projets/:to/:subject/:content} : send email to "to" with the subject "subject" and the content "content"
     *
     * @param to the mail of the recipient of the email
     * @param subject the subject of the email
     * @param content the content of the mail
     */
    @PostMapping("/projets/mail/{to}/{subject}/{content}")
    public void sendMail(@PathVariable String to, @PathVariable String subject, @PathVariable String content){
        this.mailService.sendEmail(to, subject, content, false, false);
    }

    /**
     * {@code GET  /projets/archive} : get all the projet with the archive status.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of projet in body.
     */
    @GetMapping("/projets/archive/{archive}")
    public List<ProjetDTO> findByArchive(@PathVariable boolean archive) {
        log.debug("REST request to get all projets");
        return projetService.findByArchive(archive);
    }

    /**
     * {@code GET  /projets/cursus} : get all the projet with the cursus status.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of projet in body.
     */
    @GetMapping("/projets/cursus/{cursus}/{archive}")
    public List<ProjetDTO> findByArchiveAndCursus(@PathVariable boolean archive, @PathVariable TypeCursus cursus) {
        log.debug("REST request to get all projets");
        return projetService.findByArchiveAndCursus(archive, cursus);
    }
}
