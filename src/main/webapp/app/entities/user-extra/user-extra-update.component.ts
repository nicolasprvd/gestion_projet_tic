import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { IUserExtra, UserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from './user-extra.service';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { IGroupe } from 'app/shared/model/groupe.model';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { IEvaluation } from 'app/shared/model/evaluation.model';
import { EvaluationService } from 'app/entities/evaluation/evaluation.service';

type SelectableEntity = IUser | IEvaluation | IGroupe;

@Component({
  selector: 'jhi-user-extra-update',
  templateUrl: './user-extra-update.component.html'
})
export class UserExtraUpdateComponent implements OnInit {
  isSaving = false;
  users: IUser[] = [];
  evaluations: IEvaluation[] = [];
  groupes: IGroupe[] = [];

  editForm = this.fb.group({
    id: [],
    actif: [],
    typeUtilisateur: [],
    userId: [],
    evaluationId: [],
    groupeId: []
  });

  constructor(
    protected userExtraService: UserExtraService,
    protected userService: UserService,
    protected groupeService: GroupeService,
    protected evaluationService: EvaluationService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ userExtra }) => {
      this.updateForm(userExtra);

      this.userService.query().subscribe((res: HttpResponse<IUser[]>) => (this.users = res.body || []));

      this.evaluationService.findByActif(true).subscribe(evaluations => {
        if (evaluations !== null && evaluations.body !== null) {
          this.evaluations = evaluations.body;
        }
      });

      this.groupeService.findByActif(true).subscribe(groupes => {
        if (groupes !== null && groupes.body !== null) {
          this.groupes = groupes.body;
        }
      });
    });
  }

  updateForm(userExtra: IUserExtra): void {
    this.editForm.patchValue({
      id: userExtra.id,
      actif: userExtra.actif,
      typeUtilisateur: userExtra.typeUtilisateur,
      userId: userExtra.userId,
      evaluationId: userExtra.evaluationId,
      groupeId: userExtra.groupeId
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const userExtra = this.createFromForm();
    if (userExtra.id !== undefined) {
      this.subscribeToSaveResponse(this.userExtraService.update(userExtra));
    } else {
      this.subscribeToSaveResponse(this.userExtraService.create(userExtra));
    }
  }

  private createFromForm(): IUserExtra {
    return {
      ...new UserExtra(),
      id: this.editForm.get(['id'])!.value,
      actif: this.editForm.get(['actif'])!.value,
      typeUtilisateur: this.editForm.get(['typeUtilisateur'])!.value,
      userId: this.editForm.get(['userId'])!.value,
      evaluationId: this.editForm.get(['evaluationId'])!.value,
      groupeId: this.editForm.get(['groupeId'])!.value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IUserExtra>>): void {
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
