package com.app.projettic.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.springframework.data.elasticsearch.annotations.FieldType;
import java.io.Serializable;
import java.util.Objects;
import java.util.HashSet;
import java.util.Set;

/**
 * A Groupe.
 */
@Entity
@Table(name = "groupe")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "groupe")
public class Groupe implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "valide", nullable = false)
    private Boolean valide;

    @OneToMany(mappedBy = "groupe")
    private Set<Projet> projets = new HashSet<>();

    @OneToMany(mappedBy = "groupe")
    private Set<UserExtra> userExtras = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties("groupes")
    @JoinColumn(name = "user_extra_id")
    @JsonManagedReference
    private UserExtra userExtra;

    @ManyToOne
    @JsonIgnoreProperties("groupes")
    @JsonManagedReference
    private Projet projet;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean isValide() {
        return valide;
    }

    public Groupe valide(Boolean valide) {
        this.valide = valide;
        return this;
    }

    public void setValide(Boolean valide) {
        this.valide = valide;
    }

    public Set<Projet> getProjets() {
        return projets;
    }

    public Groupe projets(Set<Projet> projets) {
        this.projets = projets;
        return this;
    }

    public Groupe addProjet(Projet projet) {
        this.projets.add(projet);
        projet.setGroupe(this);
        return this;
    }

    public Groupe removeProjet(Projet projet) {
        this.projets.remove(projet);
        projet.setGroupe(null);
        return this;
    }

    public void setProjets(Set<Projet> projets) {
        this.projets = projets;
    }

    public Set<UserExtra> getUserExtras() {
        return userExtras;
    }

    public Groupe userExtras(Set<UserExtra> userExtras) {
        this.userExtras = userExtras;
        return this;
    }

    public Groupe addUserExtra(UserExtra userExtra) {
        this.userExtras.add(userExtra);
        userExtra.setGroupe(this);
        return this;
    }

    public Groupe removeUserExtra(UserExtra userExtra) {
        this.userExtras.remove(userExtra);
        userExtra.setGroupe(null);
        return this;
    }

    public void setUserExtras(Set<UserExtra> userExtras) {
        this.userExtras = userExtras;
    }

    public UserExtra getUserExtra() {
        return userExtra;
    }

    public Groupe userExtra(UserExtra userExtra) {
        this.userExtra = userExtra;
        return this;
    }

    public void setUserExtra(UserExtra userExtra) {
        this.userExtra = userExtra;
    }

    public Projet getProjet() {
        return projet;
    }

    public Groupe projet(Projet projet) {
        this.projet = projet;
        return this;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Groupe)) {
            return false;
        }
        return id != null && id.equals(((Groupe) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "Groupe{" +
            "id=" + getId() +
            ", valide='" + isValide() + "'" +
            "}";
    }
}
