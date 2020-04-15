import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JhiDataUtils } from 'ng-jhipster';

import { IProjet } from 'app/shared/model/projet.model';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/core/user/user.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { IDocument } from 'app/shared/model/document.model';
import { DocumentService } from 'app/entities/document/document.service';
import { Account } from 'app/core/user/account.model';
import { IUser } from 'app/core/user/user.model';
import { IEvaluation } from 'app/shared/model/evaluation.model';
import { SERVER_API_URL } from 'app/app.constants';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserExtra } from 'app/shared/model/user-extra.model';

@Component({
  selector: 'jhi-projet-detail',
  templateUrl: './project-rate.component.html',
  styleUrls: ['./projet.scss']
})
export class ProjectRateComponent implements OnInit {
  public resourceUrl = SERVER_API_URL + 'api/projets';

  project!: IProjet;
  account!: Account | null;
  authorities: string[] | undefined;
  allUsers: UserExtra[] = [];
  groupUsers: UserExtra[] = [];
  groupId: number;
  user!: IUser;
  client!: IUser;
  typeUtilisateur?: TypeUtilisateur;
  login!: string | undefined;

  spec: IDocument;
  specsRate = 0;
  ganttsRate = 0;
  outputRate = 0;
  finalRate = (this.specsRate + this.ganttsRate + this.outputRate) / 3;
  evaluation: IEvaluation;

  constructor(
    protected dataUtils: JhiDataUtils,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService,
    private documentService: DocumentService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => (this.project = projet));
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
      this.authorities = account?.authorities;
    });
    // getting the group's ID and the user's type
    this.userExtraService.find(this.account.id).subscribe(userExtra => {
      this.typeUtilisateur = userExtra.body.typeUtilisateur;
      this.groupId = userExtra.body.groupeId;
    });
    this.userExtraService.find(this.project?.userExtraId).subscribe(userExtra => {
      this.userService.findById(userExtra.body.userId).subscribe(client => {
        this.client = client;
      });
    });
    // getting all the students and separating those in the group
    this.userExtraService.findAll().subscribe(userExtras => {
      this.allUsers = userExtras;
      this.allUsers.forEach(user => {
        if (user.groupeId === this.groupId) {
          this.groupUsers.push(user);
        }
      });
    });
    // getting the documents of the project
    this.project.documents.forEach();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  previousState(): void {
    window.history.back();
  }

  openFile(contentType: string, base64String: string): void {
    this.dataUtils.openFile(contentType, base64String);
  }

  isClient(): boolean {
    return this.typeUtilisateur === TypeUtilisateur.CLIENT;
  }

  calculateFinaleRate(): void {
    this.finalRate = (this.ganttsRate + this.outputRate + this.specsRate) / 3;
  }

  createEvaluation(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const source = this;
    this.evaluation = new (class implements IEvaluation {
      id: any;
      noteCdc = source.specsRate;
      noteFinale = source.finalRate;
      noteRendu = source.outputRate;
      noteSoutenance = source.ganttsRate;
    })();

    this.create(this.evaluation).subscribe(evaluation => {
      this.groupUsers.forEach(user => {
        user.evaluationId = evaluation.id;
        source.userExtraService.update(user);
      });
    });
  }

  create(evaluation: IEvaluation): Observable<IEvaluation> {
    return this.http.post<IEvaluation>(this.resourceUrl, evaluation);
  }
}
