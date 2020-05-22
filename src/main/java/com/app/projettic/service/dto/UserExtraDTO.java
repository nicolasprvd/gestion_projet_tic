package com.app.projettic.service.dto;

import java.io.Serializable;
import java.util.Objects;

import com.app.projettic.domain.enumeration.TypeCursus;
import com.app.projettic.domain.enumeration.TypeUtilisateur;

import javax.persistence.Embeddable;

/**
 * A DTO for the {@link com.app.projettic.domain.UserExtra} entity.
 */
public class UserExtraDTO implements Serializable {

    private Long id;

    private Boolean actif;

    private TypeUtilisateur typeUtilisateur;


    private Long userId;

    private Long evaluationId;

    private Long groupeId;

    private TypeCursus cursus;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean isActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }

    public TypeUtilisateur getTypeUtilisateur() {
        return typeUtilisateur;
    }

    public void setTypeUtilisateur(TypeUtilisateur typeUtilisateur) {
        this.typeUtilisateur = typeUtilisateur;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getEvaluationId() {
        return evaluationId;
    }

    public void setEvaluationId(Long evaluationId) {
        this.evaluationId = evaluationId;
    }

    public Long getGroupeId() {
        return groupeId;
    }

    public void setGroupeId(Long groupeId) {
        this.groupeId = groupeId;
    }

    public TypeCursus getCursus() {
        return cursus;
    }

    public void setCursus(TypeCursus cursus) {
        this.cursus = cursus;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        UserExtraDTO userExtraDTO = (UserExtraDTO) o;
        if (userExtraDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), userExtraDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        String grade = ((getCursus() == null) ? "null" : getCursus().toString());
        return "UserExtraDTO{" +
            "id=" + getId() +
            ", actif='" + isActif() + "'" +
            ", typeUtilisateur='" + getTypeUtilisateur() + "'" +
            ", userId=" + getUserId() +
            ", evaluationId=" + getEvaluationId() +
            ", groupeId=" + getGroupeId() +
            ", cursus=" + grade +
            "}";
    }
}
