import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {JhiDataUtils, JhiEventManager, JhiEventWithContent, JhiFileLoadError} from 'ng-jhipster';
import {IProjet, Projet} from 'app/shared/model/projet.model';
import {ProjetService} from './projet.service';
import {AlertError} from 'app/shared/alert/alert-error.model';
import {GroupeService} from 'app/entities/groupe/groupe.service';
import {UserExtraService} from 'app/entities/user-extra/user-extra.service';
import {AccountService} from 'app/core/auth/account.service';
import {Account} from 'app/core/user/account.model';
import * as moment from 'moment';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {TypeCursus} from 'app/shared/model/enumerations/type-cursus.model';
import {Groupe} from 'app/shared/model/groupe.model';
import {IUserExtra} from 'app/shared/model/user-extra.model';
import {IUser} from 'app/core/user/user.model';
import {UserService} from 'app/core/user/user.service';

@Component({
  selector: 'jhi-projet-update',
  templateUrl: './projet-update.component.html'
})
export class ProjetUpdateComponent implements OnInit {
  isSaving = false;
  project?: IProjet;
  groups: Groupe[] = [];
  extras: IUserExtra[] = [];
  users: IUser[] = [];
  subject: string;
  content: string;
  account!: Account | null;
  defaultStudentNumber: number;
  grade: string[];
  defaultGrade: TypeCursus;

  editForm = this.fb.group({
    id: [],
    nom: [null, [Validators.required]],
    descriptionPDF: [],
    descriptionPDFContentType: [],
    descriptionTexte: [],
    nbEtudiant: [],
    cursus: [''],
    automatique: [],
    archive: [],
    groupeId: [],
    userExtraId: [],
    dateCreation: []
  });

  constructor(
    protected dataUtils: JhiDataUtils,
    protected eventManager: JhiEventManager,
    protected projetService: ProjetService,
    protected groupeService: GroupeService,
    protected userService: UserService,
    protected userExtraService: UserExtraService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private accountService: AccountService,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) {
    this.defaultStudentNumber = 2;
    this.grade = [TypeCursus.L3, TypeCursus.M1, TypeCursus.M2];
    this.defaultGrade = TypeCursus.L3;
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ project }) => {
      this.project = project;
      this.updateForm(project);
      this.accountService.getAuthenticationState().subscribe(account => {
        if (account !== null) {
          this.account = account;
        }
      });
      this.groupeService.findByActif(true).subscribe(groups => {
        if (groups !== null) {
          this.groups = groups.body;
        }
      });
      this.userService.findByActivated(true).subscribe(users => {
        if (users !== null) {
          this.users = users;
        }
      });
      this.userExtraService.findByActif(true).subscribe(extras => {
        if (extras !== null) {
          this.extras = extras.body;
        }
      });
    });
  }

  /**
   * Set the project form with the project's values
   * @param project
   */
  updateForm(project: IProjet): void {
    this.defaultStudentNumber = project.nbEtudiant;
    this.defaultGrade = project.cursus;
    this.editForm.patchValue({
      id: project.id,
      nom: project.nom,
      descriptionPDF: project.descriptionPDF,
      descriptionPDFContentType: project.descriptionPDFContentType,
      descriptionTexte: project.descriptionTexte,
      nbEtudiant: project.nbEtudiant,
      cursus: project.cursus,
      automatique: project.automatique,
      archive: project.archive,
      groupeId: project.groupeId,
      userExtraId: this.account?.id,
      dateCreation: project.dateCreation
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(contentType: string, base64String: string): void {
    this.dataUtils.openFile(contentType, base64String);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe(null, (err: JhiFileLoadError) => {
      this.eventManager.broadcast(
        new JhiEventWithContent<AlertError>('projetticApp.error', { ...err, key: 'error.file.' + err.key })
      );
    });
  }

  previousState(): void {
    window.history.back();
  }

  /**
   * Insert or update a Projet object into database
   */
  saveProject(): void {
    this.isSaving = true;
    if (this.editForm.get(['id']).value !== undefined) {
      this.deleteGroups();
      const project = this.createFromForm(false);
      this.projetService.update(project).subscribe(
        () => {
          this.translateService.instant('global.toastr.modifications.projet.title', { nom: project.nom });
          this.isSaving = false;
          this.toastrService.success(
            this.translateService.instant('global.toastr.modifications.projet.message'),
            this.translateService.instant('global.toastr.modifications.projet.title', { nom: project.nom })
          );
          this.previousState();
        },
        () => {
          this.isSaving = false;
          this.toastrService.error(
            this.translateService.instant('global.toastr.erreur.message'),
            this.translateService.instant('global.toastr.erreur.title')
          );
        }
      );
    } else {
      const project = this.createFromForm(true);
      this.projetService.create(project).subscribe(
        () => {
          this.isSaving = false;
          this.toastrService.success(
            this.translateService.instant('global.toastr.creations.projet.message'),
            this.translateService.instant('global.toastr.creations.projet.title', { nom: project.nom })
          );
          this.previousState();
        },
        () => {
          this.isSaving = false;
          this.toastrService.error(
            this.translateService.instant('global.toastr.erreur.message'),
            this.translateService.instant('global.toastr.erreur.title')
          );
        }
      );
    }
  }

  /**
   * Create a Projet object based on form values
   * @param create
   */
  private createFromForm(create: boolean): IProjet {
    return {
      ...new Projet(),
      id: this.editForm.get(['id'])!.value,
      nom: this.editForm.get(['nom'])!.value,
      descriptionPDFContentType: this.editForm.get(['descriptionPDFContentType'])!.value,
      descriptionPDF: this.editForm.get(['descriptionPDF'])!.value,
      descriptionTexte: this.editForm.get(['descriptionTexte'])!.value,
      nbEtudiant: this.editForm.get(['nbEtudiant'])!.value,
      cursus: this.editForm.get(['cursus'])!.value,
      automatique: this.editForm.get(['automatique'])!.value,
      archive: false,
      groupeId: this.editForm.get(['groupeId'])!.value,
      userExtraId: this.account?.id,
      dateCreation: create === true ? moment() : this.editForm.get(['dateCreation'])!.value
    };
  }

  /**
   * Delete all group which applied to the edited project
   */
  private deleteGroups(): void {
    for (const group of this.groups) {
      if (group.projetId === this.project.id) {
        for (const extra of this.extras) {
          if (extra.groupeId === group.id) {
            extra.groupeId = null;
            this.userExtraService.update(extra).subscribe();
            this.sendEmailProjectEdited(extra.id);
          }
        }
        this.groupeService.delete(group.id).subscribe();
      }
    }
  }

  /**
   * Send an email to all members of the deleted group
   * @param extra
   */
  sendEmailProjectEdited(extra: number): void {
    for (const u of this.users) {
      if (u.id === extra) {
        this.subject = this.translateService.instant('global.email.editionProjet.sujet');
        this.content = this.translateService.instant('global.email.editionProjet.message', { nom: this.project.nom });
        this.projetService.sendMail(u.email, this.subject, this.content).subscribe();
      }
    }
  }
}
