package com.app.projettic.service.dto;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import com.app.projettic.web.rest.TestUtil;

public class GroupeDTOTest {

    @Test
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(GroupeDTO.class);
        GroupeDTO groupeDTO1 = new GroupeDTO();
        groupeDTO1.setId(1L);
        GroupeDTO groupeDTO2 = new GroupeDTO();
        assertThat(groupeDTO1).isNotEqualTo(groupeDTO2);
        groupeDTO2.setId(groupeDTO1.getId());
        assertThat(groupeDTO1).isEqualTo(groupeDTO2);
        groupeDTO2.setId(2L);
        assertThat(groupeDTO1).isNotEqualTo(groupeDTO2);
        groupeDTO1.setId(null);
        assertThat(groupeDTO1).isNotEqualTo(groupeDTO2);
    }
}
