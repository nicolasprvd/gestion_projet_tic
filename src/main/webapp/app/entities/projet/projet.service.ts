import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption, Search } from 'app/shared/util/request-util';
import { IProjet } from 'app/shared/model/projet.model';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';

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

  findByArchive(archive: boolean): Observable<EntityArrayResponseType> {
    return this.http.get<IProjet[]>(`${this.resourceUrl}/archive/${archive}`, { observe: 'response' });
  }

  findByArchiveAndCursus(archive: boolean, cursus: TypeCursus): Observable<EntityArrayResponseType> {
    return this.http.get<IProjet[]>(`${this.resourceUrl}/cursus/${cursus}/${archive}`, { observe: 'response' });
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

  findByUserExtraId(userExtraId: number): Observable<IProjet[]> {
    return this.http.get<IProjet[]>(`${this.resourceUrl}/client/${userExtraId}`);
  }

  findByGroupeId(groupeId: number): Observable<EntityResponseType> {
    return this.http.get<IProjet>(`${this.resourceUrl}/groupe/${groupeId}`, { observe: 'response' });
  }

  sendMail(to: String, subject: String, content: String): Observable<{}> {
    return this.http.post(`${this.resourceUrl}/mail/${to}/${subject}/${content}`, { observe: 'response' });
  }
}
