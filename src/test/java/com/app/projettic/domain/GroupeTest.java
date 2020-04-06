package com.app.projettic.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import com.app.projettic.web.rest.TestUtil;

public class GroupeTest {

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Groupe.class);
        Groupe groupe1 = new Groupe();
        groupe1.setId(1L);
        Groupe groupe2 = new Groupe();
        groupe2.setId(groupe1.getId());
        assertThat(groupe1).isEqualTo(groupe2);
        groupe2.setId(2L);
        assertThat(groupe1).isNotEqualTo(groupe2);
        groupe1.setId(null);
        assertThat(groupe1).isNotEqualTo(groupe2);
    }
}
