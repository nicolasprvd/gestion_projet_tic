import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JhiDataUtils, JhiFileLoadError, JhiEventManager, JhiEventWithContent } from 'ng-jhipster';
import { IProjet, Projet } from 'app/shared/model/projet.model';
import { ProjetService } from './projet.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { IGroupe } from 'app/shared/model/groupe.model';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-projet-update',
  templateUrl: './projet-update.component.html'
})
export class ProjetUpdateComponent implements OnInit {
  isSaving = false;
  groupes: IGroupe[] = [];
  userextras: IUserExtra[] = [];
  account!: Account | null;
  nbEtudiantDefault: number;

  editForm = this.fb.group({
    id: [],
    nom: [null, [Validators.required]],
    descriptionPDF: [],
    descriptionPDFContentType: [],
    descriptionTexte: [],
    nbEtudiant: [null, [Validators.required]],
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
    this.nbEtudiantDefault = 2;
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => {
      this.updateForm(projet);

      this.groupeService.findByActif(true).subscribe(groupes => {
        if (groupes !== null && groupes.body !== null) {
          this.groupes = groupes.body;
        }
      });

      this.userExtraService.findByActif(true).subscribe(userExtras => {
        if (userExtras !== null && userExtras.body !== null) {
          this.userextras = userExtras.body;
        }
      });

      this.accountService.getAuthenticationState().subscribe(account => {
        if (account !== null) {
          this.account = account;
        }
      });
    });
  }

  updateForm(projet: IProjet): void {
    this.editForm.patchValue({
      id: projet.id,
      nom: projet.nom,
      descriptionPDF: projet.descriptionPDF,
      descriptionPDFContentType: projet.descriptionPDFContentType,
      descriptionTexte: projet.descriptionTexte,
      nbEtudiant: projet.nbEtudiant,
      automatique: projet.automatique,
      archive: projet.archive,
      groupeId: projet.groupeId,
      userExtraId: this.account?.id,
      dateCreation: projet.dateCreation
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

  save(): void {
    this.isSaving = true;
    if (this.editForm.get(['id']).value !== undefined) {
      const projet = this.createFromForm(false);
      this.projetService.update(projet).subscribe(
        () => {
          this.translateService.instant('global.toastr.modifications.projet.title', { nom: projet.nom });
          this.isSaving = false;
          this.toastrService.success(
            this.translateService.instant('global.toastr.modifications.projet.message'),
            this.translateService.instant('global.toastr.modifications.projet.title', { nom: projet.nom })
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
      const projet = this.createFromForm(true);
      this.projetService.create(projet).subscribe(
        () => {
          this.translateService.instant('global.toastr.creations.projet.title', { nom: projet.nom });
          this.isSaving = false;
          this.toastrService.success(
            this.translateService.instant('global.toastr.creations.projet.message'),
            this.translateService.instant('global.toastr.creations.projet.title', { nom: projet.nom })
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

  private createFromForm(create: boolean): IProjet {
    return {
      ...new Projet(),
      id: this.editForm.get(['id'])!.value,
      nom: this.editForm.get(['nom'])!.value,
      descriptionPDFContentType: this.editForm.get(['descriptionPDFContentType'])!.value,
      descriptionPDF: this.editForm.get(['descriptionPDF'])!.value,
      descriptionTexte: this.editForm.get(['descriptionTexte'])!.value,
      nbEtudiant: this.editForm.get(['nbEtudiant'])!.value,
      automatique: this.editForm.get(['automatique'])!.value,
      archive: this.editForm.get(['archive'])!.value,
      groupeId: this.editForm.get(['groupeId'])!.value,
      userExtraId: this.account?.id,
      dateCreation: create === true ? moment() : this.editForm.get(['dateCreation'])!.value
    };
  }
}
