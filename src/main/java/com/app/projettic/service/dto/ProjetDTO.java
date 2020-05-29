package com.app.projettic.service.dto;

import com.app.projettic.domain.enumeration.TypeCursus;

import javax.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import javax.persistence.Lob;

/**
 * A DTO for the {@link com.app.projettic.domain.Projet} entity.
 */
public class ProjetDTO implements Serializable {

    private Long id;

    @NotNull
    private String nom;

    @Lob
    private byte[] descriptionPDF;

    private String descriptionPDFContentType;
    private String descriptionTexte;

    private Integer nbEtudiant;

    private Boolean automatique;

    private Boolean archive;

    private Instant dateCreation;

    private TypeCursus cursus;

    private Long groupeId;

    private Long userExtraId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public byte[] getDescriptionPDF() {
        return descriptionPDF;
    }

    public void setDescriptionPDF(byte[] descriptionPDF) {
        this.descriptionPDF = descriptionPDF;
    }

    public String getDescriptionPDFContentType() {
        return descriptionPDFContentType;
    }

    public void setDescriptionPDFContentType(String descriptionPDFContentType) {
        this.descriptionPDFContentType = descriptionPDFContentType;
    }

    public String getDescriptionTexte() {
        return descriptionTexte;
    }

    public void setDescriptionTexte(String descriptionTexte) {
        this.descriptionTexte = descriptionTexte;
    }

    public Integer getNbEtudiant() {
        return nbEtudiant;
    }

    public void setNbEtudiant(Integer nbEtudiant) {
        this.nbEtudiant = nbEtudiant;
    }

    public Boolean isAutomatique() {
        return automatique;
    }

    public void setAutomatique(Boolean automatique) {
        this.automatique = automatique;
    }

    public Boolean isArchive() {
        return archive;
    }

    public void setArchive(Boolean archive) {
        this.archive = archive;
    }

    public Long getGroupeId() {
        return groupeId;
    }

    public void setGroupeId(Long groupeId) {
        this.groupeId = groupeId;
    }

    public Long getUserExtraId() {
        return userExtraId;
    }

    public void setUserExtraId(Long userExtraId) {
        this.userExtraId = userExtraId;
    }

    public Instant getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Instant dateCreation) {
        this.dateCreation = dateCreation;
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

        ProjetDTO projetDTO = (ProjetDTO) o;
        if (projetDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), projetDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        String grade = ((getCursus() == null) ? "null" : getCursus().toString());
        return "ProjetDTO{" +
            "id=" + getId() +
            ", nom='" + getNom() + "'" +
            ", descriptionPDF='" + getDescriptionPDF() + "'" +
            ", descriptionTexte='" + getDescriptionTexte() + "'" +
            ", nbEtudiant=" + getNbEtudiant() +
            ", automatique='" + isAutomatique() + "'" +
            ", archive='" + isArchive() + "'" +
            ", dateCreation=" + getDateCreation() +
            ", groupeId=" + getGroupeId() +
            ", userExtraId=" + getUserExtraId() +
            ", cursus=" + grade +
            "}";
    }
}
