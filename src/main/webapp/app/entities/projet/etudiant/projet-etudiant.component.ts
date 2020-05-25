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
  documentZIP: IDocument;
  isSaving: boolean;
  isCreated: boolean;
  filename: string;

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
              this.documentZIP = document;
              this.updateForm(this.documentZIP);
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

  updateForm(document: IDocument): void {
    this.documentFormZIP.patchValue({
      id: document.id,
      documentZIP: document.doc,
      documentZIPContentType: document.docContentType,
      typeDocument: document.typeDocument,
      projetId: document.projetId
    });
  }

  openFile(contentType: string, base64String: string): void {
    this.filename = this.project.cursus + '_';
    this.members.forEach(membre => {
      this.filename += membre.lastName + '_';
    });
    this.filename = this.filename.substring(0, this.filename.length - 1);
    return this.dataUtils.downloadFile(contentType, base64String, this.filename);
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.isSaving = true;
    this.dataUtils.loadFileToForm(event, this.documentFormZIP, field, isImage).subscribe(null, (err: JhiFileLoadError) => {
      this.eventManager.broadcast(
        new JhiEventWithContent<AlertError>('projetticApp.error', { ...err, key: 'error.file.' + err.key })
      );
    });
  }

  handleSubmitForm(): void {
    this.saveDocument();

    if (!this.isSaving) {
      this.toastrService.success(
        this.translateService.instant('global.toastr.documents.depot.message'),
        this.translateService.instant('global.toastr.documents.depot.title')
      );
    }
  }

  saveDocument(): void {
    if (this.isSaving) {
      if (this.documentFormZIP.get(['id']).value !== null || this.isCreated) {
        const documentZIP = this.createFromForm(false);
        this.documentService.update(documentZIP).subscribe();
      } else {
        if (!this.isCreated) {
          const documentZIP = this.createFromForm(true);
          this.documentService.create(documentZIP).subscribe();
          this.isCreated = true;
        }
      }
      this.isSaving = false;
    }
  }

  createFromForm(create: boolean): IDocument {
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
