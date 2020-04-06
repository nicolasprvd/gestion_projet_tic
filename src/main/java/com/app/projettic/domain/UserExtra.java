package com.app.projettic.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;

import org.springframework.data.elasticsearch.annotations.FieldType;
import java.io.Serializable;
import java.util.Objects;
import java.util.HashSet;
import java.util.Set;

import com.app.projettic.domain.enumeration.TypeUtilisateur;

/**
 * A UserExtra.
 */
@Entity
@Table(name = "user_extra")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "userextra")
public class UserExtra implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actif")
    private Boolean actif;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_utilisateur")
    private TypeUtilisateur typeUtilisateur;

    @OneToOne
    @MapsId
    @JoinColumn(unique = true)
    private User user;

    @OneToMany(mappedBy = "userExtra")
    private Set<Groupe> groupes = new HashSet<>();

    @OneToMany(mappedBy = "userExtra")
    private Set<Projet> projets = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties("userExtras")
    private Evaluation evaluation;

    @ManyToOne
    @JsonIgnoreProperties("userExtras")
    private Groupe groupe;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean isActif() {
        return actif;
    }

    public UserExtra actif(Boolean actif) {
        this.actif = actif;
        return this;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }

    public TypeUtilisateur getTypeUtilisateur() {
        return typeUtilisateur;
    }

    public UserExtra typeUtilisateur(TypeUtilisateur typeUtilisateur) {
        this.typeUtilisateur = typeUtilisateur;
        return this;
    }

    public void setTypeUtilisateur(TypeUtilisateur typeUtilisateur) {
        this.typeUtilisateur = typeUtilisateur;
    }

    public User getUser() {
        return user;
    }

    public UserExtra user(User user) {
        this.user = user;
        return this;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Set<Groupe> getGroupes() {
        return groupes;
    }

    public UserExtra groupes(Set<Groupe> groupes) {
        this.groupes = groupes;
        return this;
    }

    public UserExtra addGroupe(Groupe groupe) {
        this.groupes.add(groupe);
        groupe.setUserExtra(this);
        return this;
    }

    public UserExtra removeGroupe(Groupe groupe) {
        this.groupes.remove(groupe);
        groupe.setUserExtra(null);
        return this;
    }

    public void setGroupes(Set<Groupe> groupes) {
        this.groupes = groupes;
    }

    public Set<Projet> getProjets() {
        return projets;
    }

    public UserExtra projets(Set<Projet> projets) {
        this.projets = projets;
        return this;
    }

    public UserExtra addProjet(Projet projet) {
        this.projets.add(projet);
        projet.setUserExtra(this);
        return this;
    }

    public UserExtra removeProjet(Projet projet) {
        this.projets.remove(projet);
        projet.setUserExtra(null);
        return this;
    }

    public void setProjets(Set<Projet> projets) {
        this.projets = projets;
    }

    public Evaluation getEvaluation() {
        return evaluation;
    }

    public UserExtra evaluation(Evaluation evaluation) {
        this.evaluation = evaluation;
        return this;
    }

    public void setEvaluation(Evaluation evaluation) {
        this.evaluation = evaluation;
    }

    public Groupe getGroupe() {
        return groupe;
    }

    public UserExtra groupe(Groupe groupe) {
        this.groupe = groupe;
        return this;
    }

    public void setGroupe(Groupe groupe) {
        this.groupe = groupe;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserExtra)) {
            return false;
        }
        return id != null && id.equals(((UserExtra) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "UserExtra{" +
            "id=" + getId() +
            ", actif='" + isActif() + "'" +
            ", typeUtilisateur='" + getTypeUtilisateur() + "'" +
            "}";
    }
}
