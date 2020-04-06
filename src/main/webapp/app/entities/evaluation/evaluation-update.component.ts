import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { IEvaluation, Evaluation } from 'app/shared/model/evaluation.model';
import { EvaluationService } from './evaluation.service';

@Component({
  selector: 'jhi-evaluation-update',
  templateUrl: './evaluation-update.component.html'
})
export class EvaluationUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    noteCDC: [null, [Validators.required]],
    noteSoutenance: [null, [Validators.required]],
    noteRendu: [null, [Validators.required]],
    noteFinale: [null, [Validators.required]]
  });

  constructor(protected evaluationService: EvaluationService, protected activatedRoute: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ evaluation }) => {
      this.updateForm(evaluation);
    });
  }

  updateForm(evaluation: IEvaluation): void {
    this.editForm.patchValue({
      id: evaluation.id,
      noteCDC: evaluation.noteCDC,
      noteSoutenance: evaluation.noteSoutenance,
      noteRendu: evaluation.noteRendu,
      noteFinale: evaluation.noteFinale
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const evaluation = this.createFromForm();
    if (evaluation.id !== undefined) {
      this.subscribeToSaveResponse(this.evaluationService.update(evaluation));
    } else {
      this.subscribeToSaveResponse(this.evaluationService.create(evaluation));
    }
  }

  private createFromForm(): IEvaluation {
    return {
      ...new Evaluation(),
      id: this.editForm.get(['id'])!.value,
      noteCDC: this.editForm.get(['noteCDC'])!.value,
      noteSoutenance: this.editForm.get(['noteSoutenance'])!.value,
      noteRendu: this.editForm.get(['noteRendu'])!.value,
      noteFinale: this.editForm.get(['noteFinale'])!.value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEvaluation>>): void {
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
}
