import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, Router, Routes } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Authority } from 'app/shared/constants/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { Evaluation, IEvaluation } from 'app/shared/model/evaluation.model';
import { EvaluationService } from './evaluation.service';
import { EvaluationComponent } from './evaluation.component';

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
      authorities: [Authority.ADMIN, Authority.CLIENT],
      pageTitle: 'projetticApp.evaluation.home.title'
    },
    canActivate: [UserRouteAccessService]
  }
];
