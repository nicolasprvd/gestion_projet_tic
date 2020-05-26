import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption, Search } from 'app/shared/util/request-util';
import { IGroupe } from 'app/shared/model/groupe.model';

type EntityResponseType = HttpResponse<IGroupe>;
type EntityArrayResponseType = HttpResponse<IGroupe[]>;

@Injectable({ providedIn: 'root' })
export class GroupeService {
  public resourceUrl = SERVER_API_URL + 'api/groupes';
  public resourceSearchUrl = SERVER_API_URL + 'api/_search/groupes';

  constructor(protected http: HttpClient) {}

  create(groupe: IGroupe): Observable<EntityResponseType> {
    return this.http.post<IGroupe>(this.resourceUrl, groupe, { observe: 'response' });
  }

  update(groupe: IGroupe): Observable<EntityResponseType> {
    return this.http.put<IGroupe>(this.resourceUrl, groupe, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IGroupe>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  findAll(): Observable<IGroupe[]> {
    return this.http.get<IGroupe[]>(`${this.resourceUrl}`);
  }

  findByActif(actif: boolean): Observable<EntityArrayResponseType> {
    return this.http.get<IGroupe[]>(`${this.resourceUrl}/actif/${actif}`, { observe: 'response' });
  }

  findByProjetId(id: number): Observable<EntityArrayResponseType> {
    return this.http.get<IGroupe[]>(`${this.resourceUrl}/projet/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IGroupe[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: Search): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IGroupe[]>(this.resourceSearchUrl, { params: options, observe: 'response' });
  }
}
