import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProjetticSharedModule } from 'app/shared/shared.module';
import { EvaluationComponent } from './evaluation.component';
import { EvaluationDetailComponent } from './evaluation-detail.component';
import { EvaluationUpdateComponent } from './evaluation-update.component';
import { EvaluationDeleteDialogComponent } from './evaluation-delete-dialog.component';
import { EvaluationExportComponent } from 'app/entities/evaluation/evaluation_export.component';
import { evaluationRoute } from './evaluation.route';

@NgModule({
  imports: [ProjetticSharedModule, RouterModule.forChild(evaluationRoute)],
  declarations: [
    EvaluationComponent,
    EvaluationDetailComponent,
    EvaluationUpdateComponent,
    EvaluationDeleteDialogComponent,
    EvaluationExportComponent
  ],
  entryComponents: [EvaluationDeleteDialogComponent]
})
export class ProjetticEvaluationModule {}
