import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { IUserExtra, UserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from './user-extra.service';

@Injectable({ providedIn: 'root' })
export class UserExtraResolve implements Resolve<IUserExtra> {
  constructor(private service: UserExtraService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IUserExtra> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((userExtra: HttpResponse<UserExtra>) => {
          if (userExtra.body) {
            return of(userExtra.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new UserExtra());
  }
}
