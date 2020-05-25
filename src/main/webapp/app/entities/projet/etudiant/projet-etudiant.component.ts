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
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-projet-etudiant',
  templateUrl: './projet-etudiant.component.html',
  styleUrls: ['./projet-etudiant.scss']
})
export class ProjetEtudiantComponent implements OnInit {
  project: IProjet;
  account: Account;
  groupId: number;
  customer: IUser;
  usersExtra: IUser[];
  members: IUser[];
  users: IUser[];
  group: Groupe;
  typeDocument: TypeDocument;
  documentCDC: IDocument;
  documentGANTT: IDocument;
  documentRF: IDocument;
  documentZIP: IDocument;
  isSavingCDC: boolean;
  isSavingGANTT: boolean;
  isSavingRF: boolean;
  isSavingZIP: boolean;
  isCreatedCDC: boolean;
  isCreatedGANTT: boolean;
  isCreatedRF: boolean;
  isCreatedZIP: boolean;

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

  documentFormZIP = this.fb.group({
    id: [],
    documentZIP: [],
    documentZIPContentType: [],
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
    private documentService: DocumentService,
    private toastrService: ToastrService,
    private translateService: TranslateService
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
      this.groupId = etudiant.body.groupeId;
      this.groupeService.find(this.groupId).subscribe(groupe => {
        this.group = groupe.body;
      });
      this.projetService.findByGroupeId(+this.groupId).subscribe(projet => {
        this.project = projet.body;
        this.documentService.findByProjetId(+this.project.id).subscribe(documents => {
          if (documents.body.length > 0) {
            documents.body.forEach(document => {
              if (document.typeDocument === TypeDocument.CDC) {
                this.documentCDC = document;
              } else if (document.typeDocument === TypeDocument.GANTT) {
                this.documentGANTT = document;
              } else if (document.typeDocument === TypeDocument.RF) {
                this.documentRF = document;
              } else {
                this.documentZIP = document;
                this.updateFormZIP(this.documentZIP);
              }
            });
          }
        });
        this.userService.findById(+this.project.userExtraId).subscribe(client => {
          this.customer = client;
          this.userExtraService.findByGroupeId(+this.groupId).subscribe(membres => {
            this.usersExtra = membres.body;
            this.userService.findAll().subscribe(users => {
              this.users = users;
              this.members = [];
              this.usersExtra.forEach(ue => {
                this.userService.findById(ue.id).subscribe(m => {
                  this.members.push(m);
                });
              });
            });
          });
        });
      });
    });
  }

  updateFormZIP(document: IDocument): void {
    this.documentFormZIP.patchValue({
      id: document.id,
      documentZIP: document.doc,
      documentZIPContentType: document.docContentType,
      typeDocument: document.typeDocument,
      projetId: document.projetId
    });
  }

  openFile(contentType: string, base64String: string): void {
    // return this.dataUtils.openFile(contentType, base64String);
    const filename = '';
    return this.dataUtils.downloadFile(contentType, base64String, filename); // (contentType: string, data: string, fileName: string)
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
    } else if (typeDocument === 'RF') {
      this.isSavingRF = true;
      this.dataUtils.loadFileToForm(event, this.documentFormRF, field, isImage).subscribe(null, (err: JhiFileLoadError) => {
        this.eventManager.broadcast(
          new JhiEventWithContent<AlertError>('projetticApp.error', { ...err, key: 'error.file.' + err.key })
        );
      });
    } else {
      this.isSavingZIP = true;
      this.dataUtils.loadFileToForm(event, this.documentFormZIP, field, isImage).subscribe(null, (err: JhiFileLoadError) => {
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
    this.saveDocumentZIP();

    if (!this.isSavingCDC || !this.isSavingGANTT || !this.isSavingRF || !this.isSavingZIP) {
      this.toastrService.success(
        this.translateService.instant('global.toastr.documents.depot.message'),
        this.translateService.instant('global.toastr.documents.depot.title')
      );
    }
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

  saveDocumentZIP(): void {
    if (this.isSavingZIP) {
      if (this.documentFormZIP.get(['id']).value !== null || this.isCreatedZIP) {
        const documentZIP = this.createFromForm(false, TypeDocument.ZIP);
        this.documentService.update(documentZIP).subscribe();
      } else {
        if (!this.isCreatedZIP) {
          const documentZIP = this.createFromForm(true, TypeDocument.ZIP);
          this.documentService.create(documentZIP).subscribe();
          this.isCreatedZIP = true;
        }
      }
      this.isSavingZIP = false;
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
        projetId: this.project.id,
        actif: true
      };
    } else if (typeDocument === TypeDocument.GANTT) {
      return {
        ...new Document(),
        id: create ? undefined : this.documentFormGANTT.get(['id']).value,
        docContentType: this.documentFormGANTT.get(['documentGANTTContentType']).value,
        doc: this.documentFormGANTT.get(['documentGANTT']).value,
        typeDocument: TypeDocument.GANTT,
        projetId: this.project.id,
        actif: true
      };
    } else if (typeDocument === TypeDocument.RF) {
      return {
        ...new Document(),
        id: create ? undefined : this.documentFormRF.get(['id']).value,
        docContentType: this.documentFormRF.get(['documentRFContentType']).value,
        doc: this.documentFormRF.get(['documentRF']).value,
        typeDocument: TypeDocument.RF,
        projetId: this.project.id,
        actif: true
      };
    } else {
      return {
        ...new Document(),
        id: create ? undefined : this.documentFormZIP.get(['id']).value,
        docContentType: this.documentFormZIP.get(['documentZIPContentType']).value,
        doc: this.documentFormZIP.get(['documentZIP']).value,
        typeDocument: TypeDocument.ZIP,
        projetId: this.project.id,
        actif: true
      };
    }
  }
}
