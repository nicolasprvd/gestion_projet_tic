import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProjetticSharedModule } from 'app/shared/shared.module';
import { GroupeComponent } from './groupe.component';
import { groupeRoute } from './groupe.route';

@NgModule({
  imports: [ProjetticSharedModule, RouterModule.forChild(groupeRoute)],
  declarations: [GroupeComponent],
  entryComponents: []
})
export class ProjetticGroupeModule {}
