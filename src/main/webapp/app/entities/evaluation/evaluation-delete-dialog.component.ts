import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IEvaluation } from 'app/shared/model/evaluation.model';
import { EvaluationService } from './evaluation.service';

@Component({
  templateUrl: './evaluation-delete-dialog.component.html'
})
export class EvaluationDeleteDialogComponent {
  evaluation?: IEvaluation;

  constructor(
    protected evaluationService: EvaluationService,
    public activeModal: NgbActiveModal,
    protected eventManager: JhiEventManager
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.evaluationService.delete(id).subscribe(() => {
      this.eventManager.broadcast('evaluationListModification');
      this.activeModal.close();
    });
  }
}
