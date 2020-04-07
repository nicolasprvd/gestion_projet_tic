import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
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

type SelectableEntity = IGroupe | IUserExtra;

@Component({
  selector: 'jhi-projet-update',
  templateUrl: './projet-update.component.html'
})
export class ProjetUpdateComponent implements OnInit {
  isSaving = false;
  groupes: IGroupe[] = [];
  userextras: IUserExtra[] = [];
  account!: Account | null;

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
    userExtraId: []
  });

  constructor(
    protected dataUtils: JhiDataUtils,
    protected eventManager: JhiEventManager,
    protected projetService: ProjetService,
    protected groupeService: GroupeService,
    protected userExtraService: UserExtraService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => {
      this.updateForm(projet);

      this.groupeService.query().subscribe((res: HttpResponse<IGroupe[]>) => (this.groupes = res.body || []));

      this.userExtraService.query().subscribe((res: HttpResponse<IUserExtra[]>) => (this.userextras = res.body || []));

      this.accountService.getAuthenticationState().subscribe(account => {
        this.account = account;
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
      userExtraId: this.account?.id
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
    const projet = this.createFromForm();
    if (projet.id !== undefined) {
      this.subscribeToSaveResponse(this.projetService.update(projet));
    } else {
      this.subscribeToSaveResponse(this.projetService.create(projet));
    }
  }

  private createFromForm(): IProjet {
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
      userExtraId: this.account?.id
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProjet>>): void {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  trackById(index: number, item: SelectableEntity): any {
    return item.id;
  }
}
