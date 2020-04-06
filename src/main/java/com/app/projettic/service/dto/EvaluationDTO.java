package com.app.projettic.service.dto;

import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.app.projettic.domain.Evaluation} entity.
 */
public class EvaluationDTO implements Serializable {
    
    private Long id;

    @NotNull
    private Double noteCDC;

    @NotNull
    private Double noteSoutenance;

    @NotNull
    private Double noteRendu;

    @NotNull
    private Double noteFinale;

    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getNoteCDC() {
        return noteCDC;
    }

    public void setNoteCDC(Double noteCDC) {
        this.noteCDC = noteCDC;
    }

    public Double getNoteSoutenance() {
        return noteSoutenance;
    }

    public void setNoteSoutenance(Double noteSoutenance) {
        this.noteSoutenance = noteSoutenance;
    }

    public Double getNoteRendu() {
        return noteRendu;
    }

    public void setNoteRendu(Double noteRendu) {
        this.noteRendu = noteRendu;
    }

    public Double getNoteFinale() {
        return noteFinale;
    }

    public void setNoteFinale(Double noteFinale) {
        this.noteFinale = noteFinale;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        EvaluationDTO evaluationDTO = (EvaluationDTO) o;
        if (evaluationDTO.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), evaluationDTO.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "EvaluationDTO{" +
            "id=" + getId() +
            ", noteCDC=" + getNoteCDC() +
            ", noteSoutenance=" + getNoteSoutenance() +
            ", noteRendu=" + getNoteRendu() +
            ", noteFinale=" + getNoteFinale() +
            "}";
    }
}
