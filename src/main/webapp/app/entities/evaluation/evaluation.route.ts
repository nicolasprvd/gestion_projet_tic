import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { Authority } from 'app/shared/constants/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { IEvaluation, Evaluation } from 'app/shared/model/evaluation.model';
import { EvaluationService } from './evaluation.service';
import { EvaluationComponent } from './evaluation.component';
import { EvaluationDetailComponent } from './evaluation-detail.component';
import { EvaluationUpdateComponent } from './evaluation-update.component';

@Injectable({ providedIn: 'root' })
export class EvaluationResolve implements Resolve<IEvaluation> {
  constructor(private service: EvaluationService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IEvaluation> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((evaluation: HttpResponse<Evaluation>) => {
          if (evaluation.body) {
            return of(evaluation.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Evaluation());
  }
}

export const evaluationRoute: Routes = [
  {
    path: '',
    component: EvaluationComponent,
    data: {
      authorities: [Authority.USER],
      pageTitle: 'projetticApp.evaluation.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/view',
    component: EvaluationDetailComponent,
    resolve: {
      evaluation: EvaluationResolve
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'projetticApp.evaluation.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: 'new',
    component: EvaluationUpdateComponent,
    resolve: {
      evaluation: EvaluationResolve
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'projetticApp.evaluation.home.title'
    },
    canActivate: [UserRouteAccessService]
  },
  {
    path: ':id/edit',
    component: EvaluationUpdateComponent,
    resolve: {
      evaluation: EvaluationResolve
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'projetticApp.evaluation.home.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
