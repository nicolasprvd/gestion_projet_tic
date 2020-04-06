package com.app.projettic.repository.search;

import com.app.projettic.domain.Projet;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link Projet} entity.
 */
public interface ProjetSearchRepository extends ElasticsearchRepository<Projet, Long> {
}
