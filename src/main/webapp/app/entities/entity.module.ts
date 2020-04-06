import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { projetRoutes } from 'app/entities/projet/projet.route';
import { ProjetReadComponent } from 'app/entities/projet/read/projet-read.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [RouterModule.forChild([projetRoutes]), CommonModule],
  declarations: [ProjetReadComponent]
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
})
export class ProjetticEntityModule {}
