package com.app.projettic.repository.search;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Configuration;

/**
 * Configure a Mock version of {@link ProjetSearchRepository} to test the
 * application without starting Elasticsearch.
 */
@Configuration
public class ProjetSearchRepositoryMockConfiguration {

    @MockBean
    private ProjetSearchRepository mockProjetSearchRepository;

}
