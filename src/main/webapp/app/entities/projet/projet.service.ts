import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption, Search } from 'app/shared/util/request-util';
import { IProjet } from 'app/shared/model/projet.model';

type EntityResponseType = HttpResponse<IProjet>;
type EntityArrayResponseType = HttpResponse<IProjet[]>;

@Injectable({ providedIn: 'root' })
export class ProjetService {
  public resourceUrl = SERVER_API_URL + 'api/projets';
  public resourceSearchUrl = SERVER_API_URL + 'api/_search/projets';

  constructor(protected http: HttpClient) {}

  create(projet: IProjet): Observable<EntityResponseType> {
    return this.http.post<IProjet>(this.resourceUrl, projet, { observe: 'response' });
  }

  update(projet: IProjet): Observable<EntityResponseType> {
    return this.http.put<IProjet>(this.resourceUrl, projet, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IProjet>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  findAll(): Observable<IProjet[]> {
    return this.http.get<IProjet[]>(`${this.resourceUrl}`);
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProjet[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IProjet[]>(this.resourceSearchUrl, { params: options, observe: 'response' });
  }
}
