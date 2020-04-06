package com.app.projettic.service.dto;

import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.app.projettic.domain.Groupe} entity.
 */
public class GroupeDTO implements Serializable {
    
    private Long id;

    @NotNull
    private Boolean valide;


    private Long userExtraId;

    private Long projetId;
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean isValide() {
        return valide;
    }

    public void setValide(Boolean valide) {
        this.valide = valide;
    }

    public Long getUserExtraId() {
        return userExtraId;
    }

    public void setUserExtraId(Long userExtraId) {
        this.userExtraId = userExtraId;
    }

    public Long getProjetId() {
        return projetId;
    }

    public void setProjetId(Long projetId) {
        this.projetId = projetId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        GroupeDTO groupeDTO = (GroupeDTO) o;
        if (groupeDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), groupeDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "GroupeDTO{" +
            "id=" + getId() +
            ", valide='" + isValide() + "'" +
            ", userExtraId=" + getUserExtraId() +
            ", projetId=" + getProjetId() +
            "}";
    }
}
