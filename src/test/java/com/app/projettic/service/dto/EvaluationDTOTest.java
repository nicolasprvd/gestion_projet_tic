package com.app.projettic.service.dto;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import com.app.projettic.web.rest.TestUtil;

public class EvaluationDTOTest {

    @Test
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(EvaluationDTO.class);
        EvaluationDTO evaluationDTO1 = new EvaluationDTO();
        evaluationDTO1.setId(1L);
        EvaluationDTO evaluationDTO2 = new EvaluationDTO();
        assertThat(evaluationDTO1).isNotEqualTo(evaluationDTO2);
        evaluationDTO2.setId(evaluationDTO1.getId());
        assertThat(evaluationDTO1).isEqualTo(evaluationDTO2);
        evaluationDTO2.setId(2L);
        assertThat(evaluationDTO1).isNotEqualTo(evaluationDTO2);
        evaluationDTO1.setId(null);
        assertThat(evaluationDTO1).isNotEqualTo(evaluationDTO2);
    }
}
