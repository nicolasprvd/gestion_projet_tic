package com.app.projettic.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class UserExtraMapperTest {

    private UserExtraMapper userExtraMapper;

    @BeforeEach
    public void setUp() {
        userExtraMapper = new UserExtraMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(userExtraMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(userExtraMapper.fromId(null)).isNull();
    }
}
