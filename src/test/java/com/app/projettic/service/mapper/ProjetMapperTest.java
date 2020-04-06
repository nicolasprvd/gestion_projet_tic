package com.app.projettic.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class ProjetMapperTest {

    private ProjetMapper projetMapper;

    @BeforeEach
    public void setUp() {
        projetMapper = new ProjetMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(projetMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(projetMapper.fromId(null)).isNull();
    }
}
