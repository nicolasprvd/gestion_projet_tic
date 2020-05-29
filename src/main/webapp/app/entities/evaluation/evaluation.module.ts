import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProjetticSharedModule } from 'app/shared/shared.module';
import { EvaluationComponent } from './evaluation.component';
import { EvaluationExportComponent } from 'app/entities/evaluation/evaluation_export.component';
import { evaluationRoute } from './evaluation.route';

@NgModule({
  imports: [ProjetticSharedModule, RouterModule.forChild(evaluationRoute)],
  declarations: [
    EvaluationComponent,
    EvaluationExportComponent
  ],
  entryComponents: []
})
export class ProjetticEvaluationModule {}
