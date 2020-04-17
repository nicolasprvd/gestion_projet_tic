import { Component, OnInit } from '@angular/core';
import { IProjet } from 'app/shared/model/projet.model';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { ProjetService } from 'app/entities/projet/projet.service';
import { JhiDataUtils, JhiEventManager, JhiEventWithContent, JhiFileLoadError } from 'ng-jhipster';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { Groupe } from 'app/shared/model/groupe.model';
import { FormBuilder } from '@angular/forms';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { TypeDocument } from 'app/shared/model/enumerations/type-document.model';
import { DocumentService } from 'app/entities/document/document.service';
import { Document, IDocument } from 'app/shared/model/document.model';

@Component({
  selector: 'jhi-projet-etudiant',
  templateUrl: './projet-etudiant.component.html',
  styleUrls: ['./projet-etudiant.scss']
})
export class ProjetEtudiantComponent implements OnInit {
  projet: IProjet;
  account: Account;
  groupeId: number;
  client: IUser;
  usersExtra: IUser[];
  membres: IUser[];
  users: IUser[];
  groupe: Groupe;
  typeDocument: TypeDocument;
  documentCDC: IDocument;
  documentGANTT: IDocument;
  documentRF: IDocument;
  isSavingCDC: boolean;
  isSavingGANTT: boolean;
  isSavingRF: boolean;
  isCreatedCDC: boolean;
  isCreatedGANTT: boolean;
  isCreatedRF: boolean;

  documentFormCDC = this.fb.group({
    id: [],
    documentCDC: [],
    documentCDCContentType: [],
    typeDocument: [],
    projetId: []
  });

  documentFormGANTT = this.fb.group({
    id: [],
    documentGANTT: [],
    documentGANTTContentType: [],
    typeDocument: [],
    projetId: []
  });

  documentFormRF = this.fb.group({
    id: [],
    documentRF: [],
    documentRFContentType: [],
    typeDocument: [],
    projetId: []
  });

  constructor(
    private accountService: AccountService,
    private userExtraService: UserExtraService,
    private projetService: ProjetService,
    protected dataUtils: JhiDataUtils,
    private userService: UserService,
    private groupeService: GroupeService,
    private fb: FormBuilder,
    protected eventManager: JhiEventManager,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });

    this.isSavingCDC = false;
    this.isSavingGANTT = false;
    this.isSavingRF = false;
    this.isCreatedCDC = false;
    this.isCreatedGANTT = false;
    this.isCreatedRF = false;

    this.userExtraService.find(this.account.id).subscribe(etudiant => {
      this.groupeId = etudiant.body.groupeId;
      this.groupeService.find(this.groupeId).subscribe(groupe => {
        this.groupe = groupe.body;
      });
      this.projetService.findByGroupeId(+this.groupeId).subscribe(projet => {
        this.projet = projet.body;
        this.documentService.findByProjetId(+this.projet.id).subscribe(documents => {
          if (documents.body.length > 0) {
            documents.body.forEach(document => {
              if (document.typeDocument === TypeDocument.CDC) {
                this.documentCDC = document;
                this.updateFormCDC(this.documentCDC);
              } else if (document.typeDocument === TypeDocument.GANTT) {
                this.documentGANTT = document;
                this.updateFormGANTT(this.documentGANTT);
              } else {
                this.documentRF = document;
                this.updateFormRF(this.documentRF);
              }
            });
          }
        });
        this.userService.findById(+this.projet.userExtraId).subscribe(client => {
          this.client = client;
          this.userExtraService.findByGroupeId(+this.groupeId).subscribe(membres => {
            this.usersExtra = membres.body;
            this.userService.findAll().subscribe(users => {
              this.users = users;
              this.membres = [];
              this.usersExtra.forEach(ue => {
                this.userService.findById(ue.id).subscribe(m => {
                  this.membres.push(m);
                });
              });
            });
          });
        });
      });
    });
  }

  updateFormCDC(document: IDocument): void {
    this.documentFormCDC.patchValue({
      id: document.id,
      documentCDC: document.doc,
      documentCDCContentType: document.docContentType,
      typeDocument: document.typeDocument,
      projetId: document.projetId
    });
  }

  updateFormGANTT(document: IDocument): void {
    this.documentFormGANTT.patchValue({
      id: document.id,
      documentGANTT: document.doc,
      documentGANTTContentType: document.docContentType,
      typeDocument: document.typeDocument,
      projetId: document.projetId
    });
  }

  updateFormRF(document: IDocument): void {
    this.documentFormRF.patchValue({
      id: document.id,
      documentRF: document.doc,
      documentRFContentType: document.docContentType,
      typeDocument: document.typeDocument,
      projetId: document.projetId
    });
  }

  openFile(contentType: string, base64String: string): void {
    return this.dataUtils.openFile(contentType, base64String);
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  setFileData(event: Event, field: string, isImage: boolean, typeDocument: string): void {
    if (typeDocument === 'CDC') {
      this.isSavingCDC = true;
      this.dataUtils.loadFileToForm(event, this.documentFormCDC, field, isImage).subscribe(null, (err: JhiFileLoadError) => {
        this.eventManager.broadcast(
          new JhiEventWithContent<AlertError>('projetticApp.error', { ...err, key: 'error.file.' + err.key })
        );
      });
    } else if (typeDocument === 'GANTT') {
      this.isSavingGANTT = true;
      this.dataUtils.loadFileToForm(event, this.documentFormGANTT, field, isImage).subscribe(null, (err: JhiFileLoadError) => {
        this.eventManager.broadcast(
          new JhiEventWithContent<AlertError>('projetticApp.error', { ...err, key: 'error.file.' + err.key })
        );
      });
    } else {
      this.isSavingRF = true;
      this.dataUtils.loadFileToForm(event, this.documentFormRF, field, isImage).subscribe(null, (err: JhiFileLoadError) => {
        this.eventManager.broadcast(
          new JhiEventWithContent<AlertError>('projetticApp.error', { ...err, key: 'error.file.' + err.key })
        );
      });
    }
  }

  handleSubmitForm(): void {
    this.saveDocumentCDC();
    this.saveDocumentGANTT();
    this.saveDocumentRF();
  }

  saveDocumentCDC(): void {
    if (this.isSavingCDC) {
      if (this.documentFormCDC.get(['id']).value !== null || this.isCreatedCDC) {
        const documentCDC = this.createFromForm(false, TypeDocument.CDC);
        this.documentService.update(documentCDC).subscribe();
      } else {
        if (!this.isCreatedCDC) {
          const documentCDC = this.createFromForm(true, TypeDocument.CDC);
          this.documentService.create(documentCDC).subscribe();
          this.isCreatedCDC = true;
        }
      }
      this.isSavingCDC = false;
    }
  }

  saveDocumentRF(): void {
    if (this.isSavingRF) {
      if (this.documentFormRF.get(['id']).value !== null || this.isCreatedRF) {
        const documentRF = this.createFromForm(false, TypeDocument.RF);
        this.documentService.update(documentRF).subscribe();
      } else {
        if (!this.isCreatedRF) {
          const documentRF = this.createFromForm(true, TypeDocument.RF);
          this.documentService.create(documentRF).subscribe();
          this.isCreatedRF = true;
        }
      }
    }
    this.isSavingRF = false;
  }

  saveDocumentGANTT(): void {
    if (this.isSavingGANTT) {
      if (this.documentFormGANTT.get(['id']).value !== null || this.isCreatedGANTT) {
        const documentGANTT = this.createFromForm(false, TypeDocument.GANTT);
        this.documentService.update(documentGANTT).subscribe();
      } else {
        if (!this.isCreatedGANTT) {
          const documentGANTT = this.createFromForm(true, TypeDocument.GANTT);
          this.documentService.create(documentGANTT).subscribe();
          this.isCreatedGANTT = true;
        }
      }
      this.isSavingGANTT = false;
    }
  }

  createFromForm(create: boolean, typeDocument: TypeDocument): IDocument {
    if (typeDocument === TypeDocument.CDC) {
      return {
        ...new Document(),
        id: create ? undefined : this.documentFormCDC.get(['id']).value,
        docContentType: this.documentFormCDC.get(['documentCDCContentType']).value,
        doc: this.documentFormCDC.get(['documentCDC']).value,
        typeDocument: TypeDocument.CDC,
        projetId: this.projet.id,
        actif: true
      };
    } else if (typeDocument === TypeDocument.GANTT) {
      return {
        ...new Document(),
        id: create ? undefined : this.documentFormGANTT.get(['id']).value,
        docContentType: this.documentFormGANTT.get(['documentGANTTContentType']).value,
        doc: this.documentFormGANTT.get(['documentGANTT']).value,
        typeDocument: TypeDocument.GANTT,
        projetId: this.projet.id,
        actif: true
      };
    } else {
      return {
        ...new Document(),
        id: create ? undefined : this.documentFormRF.get(['id']).value,
        docContentType: this.documentFormRF.get(['documentRFContentType']).value,
        doc: this.documentFormRF.get(['documentRF']).value,
        typeDocument: TypeDocument.RF,
        projetId: this.projet.id,
        actif: true
      };
    }
  }
}
