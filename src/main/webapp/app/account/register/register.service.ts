import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  constructor(private http: HttpClient) {}

  save(account: {
    typeUtilisateur: any;
    firstName: any;
    lastName: any;
    password: any;
    activated: any;
    langKey: string;
    login: any;
    email: any;
  }): Observable<{}> {
    return this.http.post(SERVER_API_URL + 'api/register', account);
  }
}
