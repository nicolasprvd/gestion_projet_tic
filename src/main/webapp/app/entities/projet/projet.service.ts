import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption, Pagination } from 'app/shared/util/request-util';
import { IProjet } from 'app/shared/model/projet.model';

@Injectable({ providedIn: 'root' })
export class ProjetService {
  public resourceUrl = SERVER_API_URL + 'api/projets';

  constructor(private http: HttpClient) {}

  create(projet: IProjet): Observable<IProjet> {
    return this.http.post<IProjet>(this.resourceUrl, projet);
  }

  update(projet: IProjet): Observable<IProjet> {
    return this.http.put<IProjet>(this.resourceUrl, projet);
  }

  findAll(): Observable<IProjet[]> {
    return this.http.get<IProjet[]>(`${this.resourceUrl}`);
  }

  query(req?: Pagination): Observable<HttpResponse<IProjet[]>> {
    const options = createRequestOption(req);
    return this.http.get<IProjet[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: bigint): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/${id}`);
  }
}
