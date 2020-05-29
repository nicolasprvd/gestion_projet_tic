import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { IDocument, Document } from 'app/shared/model/document.model';
import { DocumentService } from './document.service';

@Injectable({ providedIn: 'root' })
export class DocumentResolve implements Resolve<IDocument> {
  constructor(private service: DocumentService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IDocument> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((document: HttpResponse<Document>) => {
          if (document.body) {
            return of(document.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Document());
  }
}
