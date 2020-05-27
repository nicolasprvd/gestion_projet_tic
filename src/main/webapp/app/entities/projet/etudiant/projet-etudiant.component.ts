import { Component, OnInit, ViewChild } from '@angular/core';
import { IProjet } from 'app/shared/model/projet.model';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { ProjetService } from 'app/entities/projet/projet.service';
import { JhiDataUtils, JhiEventManager, JhiEventWithContent, JhiFileLoadError } from 'ng-jhipster';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { IGroupe } from 'app/shared/model/groupe.model';
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
  customer: IUser;
  usersExtra: IUser[] = [];
  projectManager: IUser;
  members: IUser[] = [];
  users: IUser[] = [];
  group: IGroupe;
  typeDocument: TypeDocument;
  documentZIP: IDocument;
  isSaving: boolean;
  isCreated: boolean;
  filename: string;
  @ViewChild('file_documentZIP') file_documentZIP: any;

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
      if (account !== null) {
        this.account = account;
        this.userExtraService.find(this.account.id).subscribe(accountExtra => {
          if (accountExtra) {
            this.projetService.findByGroupeId(accountExtra.body.groupeId).subscribe(project => {
              this.project = project.body;
              this.userService.findById(this.project.userExtraId).subscribe(customer => {
                if (customer !== null) {
                  this.customer = customer;
                }
              });
              this.documentService.findByProjetId(this.project.id).subscribe(document => {
                if (document && document.body) {
                  this.documentZIP = document.body;
                  this.updateForm(this.documentZIP);
                }
              });
              this.groupeService.findByProjetId(this.project.id).subscribe(group => {
                if (group && group.body) {
                  this.group = group.body;
                }
              });
              this.userExtraService.findByGroupeId(project.body.groupeId).subscribe(members => {
                if (members && members.body) {
                  this.userService.findByActivated(true).subscribe(users => {
                    if (users) {
                      for (const member of members.body) {
                        for (let user of users) {
                          if (user.id === member.id) {
                            user = this.formatFirstnameLastname(user);
                            this.members.push(user);
                            if (user.id === this.group.userExtraId) {
                              this.projectManager = user;
                            }
                          }
                        }
                      }
                    }
                  });
                }
              });
            });
          }
        });
      }
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
    this.members.forEach(member => {
      this.filename += member.lastName.toUpperCase() + '_';
    });
    this.filename = this.filename.substring(0, this.filename.length - 1);
    return this.dataUtils.downloadFile(contentType, base64String, this.filename);
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.isSaving = true;
    this.documentFormZIP.patchValue({ documentZIP: null });
    this.dataUtils.loadFileToForm(event, this.documentFormZIP, field, isImage).subscribe(null, (err: JhiFileLoadError) => {
      this.eventManager.broadcast(
        new JhiEventWithContent<AlertError>('projetticApp.error', { ...err, key: 'error.file.' + err.key })
      );
    });
  }

  saveDocument(): void {
    if (this.isSaving) {
      if (this.documentFormZIP.get(['id']).value !== null || this.isCreated) {
        const documentZIP = this.createFromForm(false);
        if (documentZIP.doc) {
          this.documentService.update(documentZIP).subscribe(updatedDoc => {
            this.documentFormZIP.patchValue({ documentZIP: updatedDoc.body.doc });
            this.toastrService.success(
              this.translateService.instant('global.toastr.documents.depot.message'),
              this.translateService.instant('global.toastr.documents.depot.title')
            );
            this.documentZIP = updatedDoc.body;
          });
        }
      } else {
        if (!this.isCreated) {
          const documentZIP = this.createFromForm(true);
          if (documentZIP.doc) {
            this.documentService.create(documentZIP).subscribe(newDoc => {
              this.documentFormZIP.patchValue({
                id: newDoc.body.id,
                documentZIPContentType: newDoc.body.docContentType,
                documentZIP: newDoc.body.doc
              });
              this.toastrService.success(
                this.translateService.instant('global.toastr.documents.depot.message'),
                this.translateService.instant('global.toastr.documents.depot.title')
              );
              this.documentZIP = newDoc.body;
            });
            this.isCreated = true;
          }
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

  deleteDoc(): void {
    const doDelete = this.documentZIP && this.documentZIP.id;
    if (doDelete) {
      this.documentService.delete(this.documentZIP.id).subscribe(() => {
        this.documentFormZIP.patchValue({ id: null });
        this.toastrService.success(
          this.translateService.instant('global.toastr.documents.delete.message'),
          this.translateService.instant('global.toastr.documents.delete.title')
        );
      });
    }
    this.documentFormZIP.patchValue({ documentZIP: null, documentZIPContentType: null });
    this.isCreated = false;
    this.documentZIP = null;
    this.file_documentZIP.nativeElement.value = null;
  }

  /**
   * Format the firstname and lastname of the user param
   * entry : aaaaaaa
   * return : Aaaaaaa
   * @param user
   */
  formatFirstnameLastname(user: IUser): IUser {
    user.firstName = user.firstName.toLowerCase();
    user.firstName = user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
    user.lastName = user.lastName.toLowerCase();
    user.lastName = user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1);
    return user;
  }
}
