import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { IGroupe, Groupe } from 'app/shared/model/groupe.model';
import { GroupeService } from './groupe.service';
import { IProjet } from 'app/shared/model/projet.model';
import { ProjetService } from 'app/entities/projet/projet.service';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';

type SelectableEntity = IUserExtra | IProjet;

@Component({
  selector: 'jhi-groupe-update',
  templateUrl: './groupe-update.component.html'
})
export class GroupeUpdateComponent implements OnInit {
  isSaving = false;
  userextras: IUserExtra[] = [];
  projets: IProjet[] = [];

  editForm = this.fb.group({
    id: [],
    valide: [null, [Validators.required]],
    userExtraId: [],
    projetId: []
  });

  constructor(
    protected groupeService: GroupeService,
    protected projetService: ProjetService,
    protected userExtraService: UserExtraService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ groupe }) => {
      this.updateForm(groupe);

      this.userExtraService.query().subscribe((res: HttpResponse<IUserExtra[]>) => (this.userextras = res.body || []));

      this.projetService.query().subscribe((res: HttpResponse<IProjet[]>) => (this.projets = res.body || []));
    });
  }

  updateForm(groupe: IGroupe): void {
    this.editForm.patchValue({
      id: groupe.id,
      valide: groupe.valide,
      userExtraId: groupe.userExtraId,
      projetId: groupe.projetId
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const groupe = this.createFromForm();
    if (groupe.id !== undefined) {
      this.subscribeToSaveResponse(this.groupeService.update(groupe));
    } else {
      this.subscribeToSaveResponse(this.groupeService.create(groupe));
    }
  }

  private createFromForm(): IGroupe {
    return {
      ...new Groupe(),
      id: this.editForm.get(['id'])!.value,
      valide: this.editForm.get(['valide'])!.value,
      userExtraId: this.editForm.get(['userExtraId'])!.value,
      projetId: this.editForm.get(['projetId'])!.value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IGroupe>>): void {
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
