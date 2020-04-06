package com.app.projettic.domain;


import javax.persistence.*;
import javax.validation.constraints.*;

import org.springframework.data.elasticsearch.annotations.FieldType;
import java.io.Serializable;
import java.util.Objects;
import java.util.HashSet;
import java.util.Set;

/**
 * A Evaluation.
 */
@Entity
@Table(name = "evaluation")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "evaluation")
public class Evaluation implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "note_cdc", nullable = false)
    private Double noteCDC;

    @NotNull
    @Column(name = "note_soutenance", nullable = false)
    private Double noteSoutenance;

    @NotNull
    @Column(name = "note_rendu", nullable = false)
    private Double noteRendu;

    @NotNull
    @Column(name = "note_finale", nullable = false)
    private Double noteFinale;

    @OneToMany(mappedBy = "evaluation")
    private Set<UserExtra> userExtras = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getNoteCDC() {
        return noteCDC;
    }

    public Evaluation noteCDC(Double noteCDC) {
        this.noteCDC = noteCDC;
        return this;
    }

    public void setNoteCDC(Double noteCDC) {
        this.noteCDC = noteCDC;
    }

    public Double getNoteSoutenance() {
        return noteSoutenance;
    }

    public Evaluation noteSoutenance(Double noteSoutenance) {
        this.noteSoutenance = noteSoutenance;
        return this;
    }

    public void setNoteSoutenance(Double noteSoutenance) {
        this.noteSoutenance = noteSoutenance;
    }

    public Double getNoteRendu() {
        return noteRendu;
    }

    public Evaluation noteRendu(Double noteRendu) {
        this.noteRendu = noteRendu;
        return this;
    }

    public void setNoteRendu(Double noteRendu) {
        this.noteRendu = noteRendu;
    }

    public Double getNoteFinale() {
        return noteFinale;
    }

    public Evaluation noteFinale(Double noteFinale) {
        this.noteFinale = noteFinale;
        return this;
    }

    public void setNoteFinale(Double noteFinale) {
        this.noteFinale = noteFinale;
    }

    public Set<UserExtra> getUserExtras() {
        return userExtras;
    }

    public Evaluation userExtras(Set<UserExtra> userExtras) {
        this.userExtras = userExtras;
        return this;
    }

    public Evaluation addUserExtra(UserExtra userExtra) {
        this.userExtras.add(userExtra);
        userExtra.setEvaluation(this);
        return this;
    }

    public Evaluation removeUserExtra(UserExtra userExtra) {
        this.userExtras.remove(userExtra);
        userExtra.setEvaluation(null);
        return this;
    }

    public void setUserExtras(Set<UserExtra> userExtras) {
        this.userExtras = userExtras;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Evaluation)) {
            return false;
        }
        return id != null && id.equals(((Evaluation) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "Evaluation{" +
            "id=" + getId() +
            ", noteCDC=" + getNoteCDC() +
            ", noteSoutenance=" + getNoteSoutenance() +
            ", noteRendu=" + getNoteRendu() +
            ", noteFinale=" + getNoteFinale() +
            "}";
    }
}
