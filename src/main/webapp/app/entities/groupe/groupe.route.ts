import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, Router, Routes } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { Authority } from 'app/shared/constants/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Groupe, IGroupe } from 'app/shared/model/groupe.model';
import { GroupeService } from './groupe.service';
import { GroupeComponent } from './groupe.component';
import { GroupeDetailComponent } from './groupe-detail.component';
import { GroupeUpdateComponent } from './groupe-update.component';

@Injectable({ providedIn: 'root' })
export class GroupeResolve implements Resolve<IGroupe> {
  constructor(private service: GroupeService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IGroupe> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((groupe: HttpResponse<Groupe>) => {
          if (groupe.body) {
            return of(groupe.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Groupe());
  }
}

export const groupeRoute: Routes = [
  {
    path: '',
    component: GroupeComponent,
    data: {
      authorities: [Authority.CLIENT, Authority.ADMIN],
      pageTitle: 'projetticApp.groupe.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/view',
    component: GroupeDetailComponent,
    resolve: {
      groupe: GroupeResolve
    },
    data: {
      authorities: [Authority.CLIENT, Authority.ADMIN],
      pageTitle: 'projetticApp.groupe.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'new',
    component: GroupeUpdateComponent,
    resolve: {
      groupe: GroupeResolve
    },
    data: {
      authorities: [Authority.ADMIN],
      pageTitle: 'projetticApp.groupe.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/edit',
    component: GroupeUpdateComponent,
    resolve: {
      groupe: GroupeResolve
    },
    data: {
      authorities: [Authority.ADMIN],
      pageTitle: 'projetticApp.groupe.home.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
