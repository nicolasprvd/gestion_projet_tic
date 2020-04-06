package com.app.projettic.web.rest;

import com.app.projettic.ProjetticApp;
import com.app.projettic.domain.Projet;
import com.app.projettic.repository.ProjetRepository;
import com.app.projettic.repository.search.ProjetSearchRepository;
import com.app.projettic.service.ProjetService;
import com.app.projettic.service.dto.ProjetDTO;
import com.app.projettic.service.mapper.ProjetMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;
import javax.persistence.EntityManager;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.elasticsearch.index.query.QueryBuilders.queryStringQuery;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the {@link ProjetResource} REST controller.
 */
@SpringBootTest(classes = ProjetticApp.class)
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
public class ProjetResourceIT {

    private static final String DEFAULT_NOM = "AAAAAAAAAA";
    private static final String UPDATED_NOM = "BBBBBBBBBB";

    private static final byte[] DEFAULT_DESCRIPTION_PDF = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_DESCRIPTION_PDF = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_DESCRIPTION_PDF_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_DESCRIPTION_PDF_CONTENT_TYPE = "image/png";

    private static final String DEFAULT_DESCRIPTION_TEXTE = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION_TEXTE = "BBBBBBBBBB";

    private static final Integer DEFAULT_NB_ETUDIANT = 1;
    private static final Integer UPDATED_NB_ETUDIANT = 2;

    private static final Boolean DEFAULT_AUTOMATIQUE = false;
    private static final Boolean UPDATED_AUTOMATIQUE = true;

    private static final Boolean DEFAULT_ARCHIVE = false;
    private static final Boolean UPDATED_ARCHIVE = true;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private ProjetMapper projetMapper;

    @Autowired
    private ProjetService projetService;

    /**
     * This repository is mocked in the com.app.projettic.repository.search test package.
     *
     * @see com.app.projettic.repository.search.ProjetSearchRepositoryMockConfiguration
     */
    @Autowired
    private ProjetSearchRepository mockProjetSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restProjetMockMvc;

    private Projet projet;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Projet createEntity(EntityManager em) {
        Projet projet = new Projet()
            .nom(DEFAULT_NOM)
            .descriptionPDF(DEFAULT_DESCRIPTION_PDF)
            .descriptionPDFContentType(DEFAULT_DESCRIPTION_PDF_CONTENT_TYPE)
            .descriptionTexte(DEFAULT_DESCRIPTION_TEXTE)
            .nbEtudiant(DEFAULT_NB_ETUDIANT)
            .automatique(DEFAULT_AUTOMATIQUE)
            .archive(DEFAULT_ARCHIVE);
        return projet;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Projet createUpdatedEntity(EntityManager em) {
        Projet projet = new Projet()
            .nom(UPDATED_NOM)
            .descriptionPDF(UPDATED_DESCRIPTION_PDF)
            .descriptionPDFContentType(UPDATED_DESCRIPTION_PDF_CONTENT_TYPE)
            .descriptionTexte(UPDATED_DESCRIPTION_TEXTE)
            .nbEtudiant(UPDATED_NB_ETUDIANT)
            .automatique(UPDATED_AUTOMATIQUE)
            .archive(UPDATED_ARCHIVE);
        return projet;
    }

    @BeforeEach
    public void initTest() {
        projet = createEntity(em);
    }

    @Test
    @Transactional
    public void createProjet() throws Exception {
        int databaseSizeBeforeCreate = projetRepository.findAll().size();

        // Create the Projet
        ProjetDTO projetDTO = projetMapper.toDto(projet);
        restProjetMockMvc.perform(post("/api/projets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(projetDTO)))
            .andExpect(status().isCreated());

        // Validate the Projet in the database
        List<Projet> projetList = projetRepository.findAll();
        assertThat(projetList).hasSize(databaseSizeBeforeCreate + 1);
        Projet testProjet = projetList.get(projetList.size() - 1);
        assertThat(testProjet.getNom()).isEqualTo(DEFAULT_NOM);
        assertThat(testProjet.getDescriptionPDF()).isEqualTo(DEFAULT_DESCRIPTION_PDF);
        assertThat(testProjet.getDescriptionPDFContentType()).isEqualTo(DEFAULT_DESCRIPTION_PDF_CONTENT_TYPE);
        assertThat(testProjet.getDescriptionTexte()).isEqualTo(DEFAULT_DESCRIPTION_TEXTE);
        assertThat(testProjet.getNbEtudiant()).isEqualTo(DEFAULT_NB_ETUDIANT);
        assertThat(testProjet.isAutomatique()).isEqualTo(DEFAULT_AUTOMATIQUE);
        assertThat(testProjet.isArchive()).isEqualTo(DEFAULT_ARCHIVE);

        // Validate the Projet in Elasticsearch
        verify(mockProjetSearchRepository, times(1)).save(testProjet);
    }

    @Test
    @Transactional
    public void createProjetWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = projetRepository.findAll().size();

        // Create the Projet with an existing ID
        projet.setId(1L);
        ProjetDTO projetDTO = projetMapper.toDto(projet);

        // An entity with an existing ID cannot be created, so this API call must fail
        restProjetMockMvc.perform(post("/api/projets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(projetDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Projet in the database
        List<Projet> projetList = projetRepository.findAll();
        assertThat(projetList).hasSize(databaseSizeBeforeCreate);

        // Validate the Projet in Elasticsearch
        verify(mockProjetSearchRepository, times(0)).save(projet);
    }


    @Test
    @Transactional
    public void checkNomIsRequired() throws Exception {
        int databaseSizeBeforeTest = projetRepository.findAll().size();
        // set the field null
        projet.setNom(null);

        // Create the Projet, which fails.
        ProjetDTO projetDTO = projetMapper.toDto(projet);

        restProjetMockMvc.perform(post("/api/projets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(projetDTO)))
            .andExpect(status().isBadRequest());

        List<Projet> projetList = projetRepository.findAll();
        assertThat(projetList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllProjets() throws Exception {
        // Initialize the database
        projetRepository.saveAndFlush(projet);

        // Get all the projetList
        restProjetMockMvc.perform(get("/api/projets?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(projet.getId().intValue())))
            .andExpect(jsonPath("$.[*].nom").value(hasItem(DEFAULT_NOM)))
            .andExpect(jsonPath("$.[*].descriptionPDFContentType").value(hasItem(DEFAULT_DESCRIPTION_PDF_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].descriptionPDF").value(hasItem(Base64Utils.encodeToString(DEFAULT_DESCRIPTION_PDF))))
            .andExpect(jsonPath("$.[*].descriptionTexte").value(hasItem(DEFAULT_DESCRIPTION_TEXTE)))
            .andExpect(jsonPath("$.[*].nbEtudiant").value(hasItem(DEFAULT_NB_ETUDIANT)))
            .andExpect(jsonPath("$.[*].automatique").value(hasItem(DEFAULT_AUTOMATIQUE.booleanValue())))
            .andExpect(jsonPath("$.[*].archive").value(hasItem(DEFAULT_ARCHIVE.booleanValue())));
    }
    
    @Test
    @Transactional
    public void getProjet() throws Exception {
        // Initialize the database
        projetRepository.saveAndFlush(projet);

        // Get the projet
        restProjetMockMvc.perform(get("/api/projets/{id}", projet.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(projet.getId().intValue()))
            .andExpect(jsonPath("$.nom").value(DEFAULT_NOM))
            .andExpect(jsonPath("$.descriptionPDFContentType").value(DEFAULT_DESCRIPTION_PDF_CONTENT_TYPE))
            .andExpect(jsonPath("$.descriptionPDF").value(Base64Utils.encodeToString(DEFAULT_DESCRIPTION_PDF)))
            .andExpect(jsonPath("$.descriptionTexte").value(DEFAULT_DESCRIPTION_TEXTE))
            .andExpect(jsonPath("$.nbEtudiant").value(DEFAULT_NB_ETUDIANT))
            .andExpect(jsonPath("$.automatique").value(DEFAULT_AUTOMATIQUE.booleanValue()))
            .andExpect(jsonPath("$.archive").value(DEFAULT_ARCHIVE.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingProjet() throws Exception {
        // Get the projet
        restProjetMockMvc.perform(get("/api/projets/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateProjet() throws Exception {
        // Initialize the database
        projetRepository.saveAndFlush(projet);

        int databaseSizeBeforeUpdate = projetRepository.findAll().size();

        // Update the projet
        Projet updatedProjet = projetRepository.findById(projet.getId()).get();
        // Disconnect from session so that the updates on updatedProjet are not directly saved in db
        em.detach(updatedProjet);
        updatedProjet
            .nom(UPDATED_NOM)
            .descriptionPDF(UPDATED_DESCRIPTION_PDF)
            .descriptionPDFContentType(UPDATED_DESCRIPTION_PDF_CONTENT_TYPE)
            .descriptionTexte(UPDATED_DESCRIPTION_TEXTE)
            .nbEtudiant(UPDATED_NB_ETUDIANT)
            .automatique(UPDATED_AUTOMATIQUE)
            .archive(UPDATED_ARCHIVE);
        ProjetDTO projetDTO = projetMapper.toDto(updatedProjet);

        restProjetMockMvc.perform(put("/api/projets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(projetDTO)))
            .andExpect(status().isOk());

        // Validate the Projet in the database
        List<Projet> projetList = projetRepository.findAll();
        assertThat(projetList).hasSize(databaseSizeBeforeUpdate);
        Projet testProjet = projetList.get(projetList.size() - 1);
        assertThat(testProjet.getNom()).isEqualTo(UPDATED_NOM);
        assertThat(testProjet.getDescriptionPDF()).isEqualTo(UPDATED_DESCRIPTION_PDF);
        assertThat(testProjet.getDescriptionPDFContentType()).isEqualTo(UPDATED_DESCRIPTION_PDF_CONTENT_TYPE);
        assertThat(testProjet.getDescriptionTexte()).isEqualTo(UPDATED_DESCRIPTION_TEXTE);
        assertThat(testProjet.getNbEtudiant()).isEqualTo(UPDATED_NB_ETUDIANT);
        assertThat(testProjet.isAutomatique()).isEqualTo(UPDATED_AUTOMATIQUE);
        assertThat(testProjet.isArchive()).isEqualTo(UPDATED_ARCHIVE);

        // Validate the Projet in Elasticsearch
        verify(mockProjetSearchRepository, times(1)).save(testProjet);
    }

    @Test
    @Transactional
    public void updateNonExistingProjet() throws Exception {
        int databaseSizeBeforeUpdate = projetRepository.findAll().size();

        // Create the Projet
        ProjetDTO projetDTO = projetMapper.toDto(projet);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProjetMockMvc.perform(put("/api/projets")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(projetDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Projet in the database
        List<Projet> projetList = projetRepository.findAll();
        assertThat(projetList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Projet in Elasticsearch
        verify(mockProjetSearchRepository, times(0)).save(projet);
    }

    @Test
    @Transactional
    public void deleteProjet() throws Exception {
        // Initialize the database
        projetRepository.saveAndFlush(projet);

        int databaseSizeBeforeDelete = projetRepository.findAll().size();

        // Delete the projet
        restProjetMockMvc.perform(delete("/api/projets/{id}", projet.getId())
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Projet> projetList = projetRepository.findAll();
        assertThat(projetList).hasSize(databaseSizeBeforeDelete - 1);

        // Validate the Projet in Elasticsearch
        verify(mockProjetSearchRepository, times(1)).deleteById(projet.getId());
    }

    @Test
    @Transactional
    public void searchProjet() throws Exception {
        // Initialize the database
        projetRepository.saveAndFlush(projet);
        when(mockProjetSearchRepository.search(queryStringQuery("id:" + projet.getId())))
            .thenReturn(Collections.singletonList(projet));
        // Search the projet
        restProjetMockMvc.perform(get("/api/_search/projets?query=id:" + projet.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(projet.getId().intValue())))
            .andExpect(jsonPath("$.[*].nom").value(hasItem(DEFAULT_NOM)))
            .andExpect(jsonPath("$.[*].descriptionPDFContentType").value(hasItem(DEFAULT_DESCRIPTION_PDF_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].descriptionPDF").value(hasItem(Base64Utils.encodeToString(DEFAULT_DESCRIPTION_PDF))))
            .andExpect(jsonPath("$.[*].descriptionTexte").value(hasItem(DEFAULT_DESCRIPTION_TEXTE)))
            .andExpect(jsonPath("$.[*].nbEtudiant").value(hasItem(DEFAULT_NB_ETUDIANT)))
            .andExpect(jsonPath("$.[*].automatique").value(hasItem(DEFAULT_AUTOMATIQUE.booleanValue())))
            .andExpect(jsonPath("$.[*].archive").value(hasItem(DEFAULT_ARCHIVE.booleanValue())));
    }
}
