import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IEvaluation } from 'app/shared/model/evaluation.model';

@Component({
  selector: 'jhi-evaluation-detail',
  templateUrl: './evaluation-detail.component.html'
})
export class EvaluationDetailComponent implements OnInit {
  evaluation: IEvaluation | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ evaluation }) => (this.evaluation = evaluation));
  }

  previousState(): void {
    window.history.back();
  }
}
