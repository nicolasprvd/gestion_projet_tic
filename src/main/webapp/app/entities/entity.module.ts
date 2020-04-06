import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'evaluation',
        loadChildren: () => import('./evaluation/evaluation.module').then(m => m.ProjetticEvaluationModule)
      },
      {
        path: 'user-extra',
        loadChildren: () => import('./user-extra/user-extra.module').then(m => m.ProjetticUserExtraModule)
      },
      {
        path: 'document',
        loadChildren: () => import('./document/document.module').then(m => m.ProjetticDocumentModule)
      },
      {
        path: 'projet',
        loadChildren: () => import('./projet/projet.module').then(m => m.ProjetticProjetModule)
      },
      {
        path: 'groupe',
        loadChildren: () => import('./groupe/groupe.module').then(m => m.ProjetticGroupeModule)
      }
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ])
  ]
})
export class ProjetticEntityModule {}
