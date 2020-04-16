package com.app.projettic.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javax.persistence.*;
import javax.validation.constraints.*;
import java.io.Serializable;

import com.app.projettic.domain.enumeration.TypeDocument;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Document.
 */
@Entity
@Table(name = "document")
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@org.springframework.data.elasticsearch.annotations.Document(indexName = "document")
public class Document implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Lob
    @Column(name = "doc", nullable = false)
    private byte[] doc;

    @Column(name = "doc_content_type", nullable = false)
    private String docContentType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type_document", nullable = false)
    private TypeDocument typeDocument;

    @ManyToOne
    @JsonIgnoreProperties("documents")
    private Projet projet;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getDoc() {
        return doc;
    }

    public Document doc(byte[] doc) {
        this.doc = doc;
        return this;
    }

    public void setDoc(byte[] doc) {
        this.doc = doc;
    }

    public String getDocContentType() {
        return docContentType;
    }

    public Document docContentType(String docContentType) {
        this.docContentType = docContentType;
        return this;
    }

    public void setDocContentType(String docContentType) {
        this.docContentType = docContentType;
    }

    public TypeDocument getTypeDocument() {
        return typeDocument;
    }

    public Document typeDocument(TypeDocument typeDocument) {
        this.typeDocument = typeDocument;
        return this;
    }

    public void setTypeDocument(TypeDocument typeDocument) {
        this.typeDocument = typeDocument;
    }

    public Projet getProjet() {
        return projet;
    }

    public Document projet(Projet projet) {
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
        if (!(o instanceof Document)) {
            return false;
        }
        return id != null && id.equals(((Document) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "Document{" +
            "id=" + getId() +
            ", doc='" + getDoc() + "'" +
            ", docContentType='" + getDocContentType() + "'" +
            ", typeDocument='" + getTypeDocument() + "'" +
            ", projet='" + getProjet() +
            "}";
    }
}
