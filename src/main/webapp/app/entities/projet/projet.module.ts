import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProjetticSharedModule } from 'app/shared/shared.module';
import { ProjetComponent } from './projet.component';
import { ProjetDetailComponent } from './projet-detail.component';
import { ProjetUpdateComponent } from './projet-update.component';
import { ProjetDeleteDialogComponent } from './projet-delete-dialog.component';
import { projetRoute } from './projet.route';
import { ProjetPostulerComponent } from 'app/entities/projet/postuler/projet-postuler.component';
import { ProjetAttribuerComponent } from 'app/entities/projet/attribuer/projet-attribuer.component';

@NgModule({
  imports: [ProjetticSharedModule, RouterModule.forChild(projetRoute)],
  declarations: [
    ProjetComponent,
    ProjetDetailComponent,
    ProjetUpdateComponent,
    ProjetDeleteDialogComponent,
    ProjetPostulerComponent,
    ProjetAttribuerComponent
  ],
  entryComponents: [ProjetDeleteDialogComponent]
})
export class ProjetticProjetModule {}
