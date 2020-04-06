package com.app.projettic.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class GroupeMapperTest {

    private GroupeMapper groupeMapper;

    @BeforeEach
    public void setUp() {
        groupeMapper = new GroupeMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(groupeMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(groupeMapper.fromId(null)).isNull();
    }
}
