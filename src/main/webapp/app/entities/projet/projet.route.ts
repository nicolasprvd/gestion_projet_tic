import { Route } from '@angular/router';
import { ProjetReadComponent } from 'app/entities/projet/read/projet-read.component';

export const projetRoutes: Route = {
  path: 'projets',
  component: ProjetReadComponent,
  data: {
    authorities: [],
    pageTitle: 'home.title'
  }
};
