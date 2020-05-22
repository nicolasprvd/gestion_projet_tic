import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JhiDataUtils, JhiFileLoadError, JhiEventManager, JhiEventWithContent } from 'ng-jhipster';
import { IProjet, Projet } from 'app/shared/model/projet.model';
import { ProjetService } from './projet.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { IGroupe } from 'app/shared/model/groupe.model';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';

@Component({
  selector: 'jhi-projet-update',
  templateUrl: './projet-update.component.html'
})
export class ProjetUpdateComponent implements OnInit {
  isSaving = false;
  groups: IGroupe[] = [];
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
    nbEtudiant: [null, [Validators.required]],
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
      this.updateForm(project);
      this.groupeService.findByActif(true).subscribe(groups => {
        if (groups !== null && groups.body !== null) {
          this.groups = groups.body;
        }
      });
      this.accountService.getAuthenticationState().subscribe(account => {
        if (account !== null) {
          this.account = account;
        }
      });
    });
  }

  /**
   * Set the project form with the project's values
   * @param project
   */
  updateForm(project: IProjet): void {
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
}
