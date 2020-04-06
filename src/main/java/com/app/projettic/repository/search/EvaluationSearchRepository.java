package com.app.projettic.repository.search;

import com.app.projettic.domain.Evaluation;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link Evaluation} entity.
 */
public interface EvaluationSearchRepository extends ElasticsearchRepository<Evaluation, Long> {
}
