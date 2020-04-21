import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProjetticSharedModule } from 'app/shared/shared.module';
import { HOME_ROUTE } from './home.route';
import { HomeComponent } from './home.component';
import { HomeNouvelleAnneeComponent } from 'app/home/home-nouvelleAnnee.component';

@NgModule({
  imports: [ProjetticSharedModule, RouterModule.forChild([HOME_ROUTE])],
  declarations: [HomeComponent, HomeNouvelleAnneeComponent]
})
export class ProjetticHomeModule {}
