package com.app.projettic.web.rest;

import com.app.projettic.ProjetticApp;
import com.app.projettic.domain.Evaluation;
import com.app.projettic.repository.EvaluationRepository;
import com.app.projettic.repository.search.EvaluationSearchRepository;
import com.app.projettic.service.EvaluationService;
import com.app.projettic.service.dto.EvaluationDTO;
import com.app.projettic.service.mapper.EvaluationMapper;

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
 * Integration tests for the {@link EvaluationResource} REST controller.
 */
@SpringBootTest(classes = ProjetticApp.class)
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
public class EvaluationResourceIT {

    private static final Double DEFAULT_NOTE_CDC = 1D;
    private static final Double UPDATED_NOTE_CDC = 2D;

    private static final Double DEFAULT_NOTE_SOUTENANCE = 1D;
    private static final Double UPDATED_NOTE_SOUTENANCE = 2D;

    private static final Double DEFAULT_NOTE_RENDU = 1D;
    private static final Double UPDATED_NOTE_RENDU = 2D;

    private static final Double DEFAULT_NOTE_FINALE = 1D;
    private static final Double UPDATED_NOTE_FINALE = 2D;

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private EvaluationMapper evaluationMapper;

    @Autowired
    private EvaluationService evaluationService;

    /**
     * This repository is mocked in the com.app.projettic.repository.search test package.
     *
     * @see com.app.projettic.repository.search.EvaluationSearchRepositoryMockConfiguration
     */
    @Autowired
    private EvaluationSearchRepository mockEvaluationSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restEvaluationMockMvc;

    private Evaluation evaluation;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Evaluation createEntity(EntityManager em) {
        Evaluation evaluation = new Evaluation()
            .noteCDC(DEFAULT_NOTE_CDC)
            .noteSoutenance(DEFAULT_NOTE_SOUTENANCE)
            .noteRendu(DEFAULT_NOTE_RENDU)
            .noteFinale(DEFAULT_NOTE_FINALE);
        return evaluation;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Evaluation createUpdatedEntity(EntityManager em) {
        Evaluation evaluation = new Evaluation()
            .noteCDC(UPDATED_NOTE_CDC)
            .noteSoutenance(UPDATED_NOTE_SOUTENANCE)
            .noteRendu(UPDATED_NOTE_RENDU)
            .noteFinale(UPDATED_NOTE_FINALE);
        return evaluation;
    }

    @BeforeEach
    public void initTest() {
        evaluation = createEntity(em);
    }

    @Test
    @Transactional
    public void createEvaluation() throws Exception {
        int databaseSizeBeforeCreate = evaluationRepository.findAll().size();

        // Create the Evaluation
        EvaluationDTO evaluationDTO = evaluationMapper.toDto(evaluation);
        restEvaluationMockMvc.perform(post("/api/evaluations")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(evaluationDTO)))
            .andExpect(status().isCreated());

        // Validate the Evaluation in the database
        List<Evaluation> evaluationList = evaluationRepository.findAll();
        assertThat(evaluationList).hasSize(databaseSizeBeforeCreate + 1);
        Evaluation testEvaluation = evaluationList.get(evaluationList.size() - 1);
        assertThat(testEvaluation.getNoteCDC()).isEqualTo(DEFAULT_NOTE_CDC);
        assertThat(testEvaluation.getNoteSoutenance()).isEqualTo(DEFAULT_NOTE_SOUTENANCE);
        assertThat(testEvaluation.getNoteRendu()).isEqualTo(DEFAULT_NOTE_RENDU);
        assertThat(testEvaluation.getNoteFinale()).isEqualTo(DEFAULT_NOTE_FINALE);

        // Validate the Evaluation in Elasticsearch
        verify(mockEvaluationSearchRepository, times(1)).save(testEvaluation);
    }

    @Test
    @Transactional
    public void createEvaluationWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = evaluationRepository.findAll().size();

        // Create the Evaluation with an existing ID
        evaluation.setId(1L);
        EvaluationDTO evaluationDTO = evaluationMapper.toDto(evaluation);

        // An entity with an existing ID cannot be created, so this API call must fail
        restEvaluationMockMvc.perform(post("/api/evaluations")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(evaluationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Evaluation in the database
        List<Evaluation> evaluationList = evaluationRepository.findAll();
        assertThat(evaluationList).hasSize(databaseSizeBeforeCreate);

        // Validate the Evaluation in Elasticsearch
        verify(mockEvaluationSearchRepository, times(0)).save(evaluation);
    }


    @Test
    @Transactional
    public void checkNoteCDCIsRequired() throws Exception {
        int databaseSizeBeforeTest = evaluationRepository.findAll().size();
        // set the field null
        evaluation.setNoteCDC(null);

        // Create the Evaluation, which fails.
        EvaluationDTO evaluationDTO = evaluationMapper.toDto(evaluation);

        restEvaluationMockMvc.perform(post("/api/evaluations")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(evaluationDTO)))
            .andExpect(status().isBadRequest());

        List<Evaluation> evaluationList = evaluationRepository.findAll();
        assertThat(evaluationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkNoteSoutenanceIsRequired() throws Exception {
        int databaseSizeBeforeTest = evaluationRepository.findAll().size();
        // set the field null
        evaluation.setNoteSoutenance(null);

        // Create the Evaluation, which fails.
        EvaluationDTO evaluationDTO = evaluationMapper.toDto(evaluation);

        restEvaluationMockMvc.perform(post("/api/evaluations")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(evaluationDTO)))
            .andExpect(status().isBadRequest());

        List<Evaluation> evaluationList = evaluationRepository.findAll();
        assertThat(evaluationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkNoteRenduIsRequired() throws Exception {
        int databaseSizeBeforeTest = evaluationRepository.findAll().size();
        // set the field null
        evaluation.setNoteRendu(null);

        // Create the Evaluation, which fails.
        EvaluationDTO evaluationDTO = evaluationMapper.toDto(evaluation);

        restEvaluationMockMvc.perform(post("/api/evaluations")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(evaluationDTO)))
            .andExpect(status().isBadRequest());

        List<Evaluation> evaluationList = evaluationRepository.findAll();
        assertThat(evaluationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void checkNoteFinaleIsRequired() throws Exception {
        int databaseSizeBeforeTest = evaluationRepository.findAll().size();
        // set the field null
        evaluation.setNoteFinale(null);

        // Create the Evaluation, which fails.
        EvaluationDTO evaluationDTO = evaluationMapper.toDto(evaluation);

        restEvaluationMockMvc.perform(post("/api/evaluations")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(evaluationDTO)))
            .andExpect(status().isBadRequest());

        List<Evaluation> evaluationList = evaluationRepository.findAll();
        assertThat(evaluationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllEvaluations() throws Exception {
        // Initialize the database
        evaluationRepository.saveAndFlush(evaluation);

        // Get all the evaluationList
        restEvaluationMockMvc.perform(get("/api/evaluations?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(evaluation.getId().intValue())))
            .andExpect(jsonPath("$.[*].noteCDC").value(hasItem(DEFAULT_NOTE_CDC.doubleValue())))
            .andExpect(jsonPath("$.[*].noteSoutenance").value(hasItem(DEFAULT_NOTE_SOUTENANCE.doubleValue())))
            .andExpect(jsonPath("$.[*].noteRendu").value(hasItem(DEFAULT_NOTE_RENDU.doubleValue())))
            .andExpect(jsonPath("$.[*].noteFinale").value(hasItem(DEFAULT_NOTE_FINALE.doubleValue())));
    }
    
    @Test
    @Transactional
    public void getEvaluation() throws Exception {
        // Initialize the database
        evaluationRepository.saveAndFlush(evaluation);

        // Get the evaluation
        restEvaluationMockMvc.perform(get("/api/evaluations/{id}", evaluation.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(evaluation.getId().intValue()))
            .andExpect(jsonPath("$.noteCDC").value(DEFAULT_NOTE_CDC.doubleValue()))
            .andExpect(jsonPath("$.noteSoutenance").value(DEFAULT_NOTE_SOUTENANCE.doubleValue()))
            .andExpect(jsonPath("$.noteRendu").value(DEFAULT_NOTE_RENDU.doubleValue()))
            .andExpect(jsonPath("$.noteFinale").value(DEFAULT_NOTE_FINALE.doubleValue()));
    }

    @Test
    @Transactional
    public void getNonExistingEvaluation() throws Exception {
        // Get the evaluation
        restEvaluationMockMvc.perform(get("/api/evaluations/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateEvaluation() throws Exception {
        // Initialize the database
        evaluationRepository.saveAndFlush(evaluation);

        int databaseSizeBeforeUpdate = evaluationRepository.findAll().size();

        // Update the evaluation
        Evaluation updatedEvaluation = evaluationRepository.findById(evaluation.getId()).get();
        // Disconnect from session so that the updates on updatedEvaluation are not directly saved in db
        em.detach(updatedEvaluation);
        updatedEvaluation
            .noteCDC(UPDATED_NOTE_CDC)
            .noteSoutenance(UPDATED_NOTE_SOUTENANCE)
            .noteRendu(UPDATED_NOTE_RENDU)
            .noteFinale(UPDATED_NOTE_FINALE);
        EvaluationDTO evaluationDTO = evaluationMapper.toDto(updatedEvaluation);

        restEvaluationMockMvc.perform(put("/api/evaluations")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(evaluationDTO)))
            .andExpect(status().isOk());

        // Validate the Evaluation in the database
        List<Evaluation> evaluationList = evaluationRepository.findAll();
        assertThat(evaluationList).hasSize(databaseSizeBeforeUpdate);
        Evaluation testEvaluation = evaluationList.get(evaluationList.size() - 1);
        assertThat(testEvaluation.getNoteCDC()).isEqualTo(UPDATED_NOTE_CDC);
        assertThat(testEvaluation.getNoteSoutenance()).isEqualTo(UPDATED_NOTE_SOUTENANCE);
        assertThat(testEvaluation.getNoteRendu()).isEqualTo(UPDATED_NOTE_RENDU);
        assertThat(testEvaluation.getNoteFinale()).isEqualTo(UPDATED_NOTE_FINALE);

        // Validate the Evaluation in Elasticsearch
        verify(mockEvaluationSearchRepository, times(1)).save(testEvaluation);
    }

    @Test
    @Transactional
    public void updateNonExistingEvaluation() throws Exception {
        int databaseSizeBeforeUpdate = evaluationRepository.findAll().size();

        // Create the Evaluation
        EvaluationDTO evaluationDTO = evaluationMapper.toDto(evaluation);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEvaluationMockMvc.perform(put("/api/evaluations")
            .contentType(MediaType.APPLICATION_JSON)
            .content(TestUtil.convertObjectToJsonBytes(evaluationDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Evaluation in the database
        List<Evaluation> evaluationList = evaluationRepository.findAll();
        assertThat(evaluationList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Evaluation in Elasticsearch
        verify(mockEvaluationSearchRepository, times(0)).save(evaluation);
    }

    @Test
    @Transactional
    public void deleteEvaluation() throws Exception {
        // Initialize the database
        evaluationRepository.saveAndFlush(evaluation);

        int databaseSizeBeforeDelete = evaluationRepository.findAll().size();

        // Delete the evaluation
        restEvaluationMockMvc.perform(delete("/api/evaluations/{id}", evaluation.getId())
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Evaluation> evaluationList = evaluationRepository.findAll();
        assertThat(evaluationList).hasSize(databaseSizeBeforeDelete - 1);

        // Validate the Evaluation in Elasticsearch
        verify(mockEvaluationSearchRepository, times(1)).deleteById(evaluation.getId());
    }

    @Test
    @Transactional
    public void searchEvaluation() throws Exception {
        // Initialize the database
        evaluationRepository.saveAndFlush(evaluation);
        when(mockEvaluationSearchRepository.search(queryStringQuery("id:" + evaluation.getId())))
            .thenReturn(Collections.singletonList(evaluation));
        // Search the evaluation
        restEvaluationMockMvc.perform(get("/api/_search/evaluations?query=id:" + evaluation.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(evaluation.getId().intValue())))
            .andExpect(jsonPath("$.[*].noteCDC").value(hasItem(DEFAULT_NOTE_CDC.doubleValue())))
            .andExpect(jsonPath("$.[*].noteSoutenance").value(hasItem(DEFAULT_NOTE_SOUTENANCE.doubleValue())))
            .andExpect(jsonPath("$.[*].noteRendu").value(hasItem(DEFAULT_NOTE_RENDU.doubleValue())))
            .andExpect(jsonPath("$.[*].noteFinale").value(hasItem(DEFAULT_NOTE_FINALE.doubleValue())));
    }
}
