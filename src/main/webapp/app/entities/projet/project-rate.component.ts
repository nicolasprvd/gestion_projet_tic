import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JhiDataUtils } from 'ng-jhipster';

import { IProjet } from 'app/shared/model/projet.model';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/core/user/user.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { DocumentService } from 'app/entities/document/document.service';
import { Account } from 'app/core/user/account.model';
import { IUser } from 'app/core/user/user.model';
import { Evaluation, IEvaluation } from 'app/shared/model/evaluation.model';
import { SERVER_API_URL } from 'app/app.constants';
import { HttpClient } from '@angular/common/http';
import { UserExtra } from 'app/shared/model/user-extra.model';
import { EvaluationService } from 'app/entities/evaluation/evaluation.service';

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
  finalRate = 0;
  specsRate = 0;
  ganttsRate = 0;
  outputRate = 0;
  isSaving = false;

  constructor(
    protected dataUtils: JhiDataUtils,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService,
    private documentService: DocumentService,
    private http: HttpClient,
    private evaluationService: EvaluationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => (this.project = projet));
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
      this.authorities = account?.authorities;
    });
    this.userExtraService.findAll().subscribe(userExtras => {
      this.groupId = this.project.groupeId;
      this.allUsers = userExtras;
      for (const extra of userExtras) {
        if (extra.groupeId === this.groupId) {
          this.groupUsers.push(extra);
        }
      }
    });
    // getting the documents of the project
    // this.project.documents.forEach();
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(contentType: string, base64String: string): void {
    this.dataUtils.openFile(contentType, base64String);
  }

  calculateFinalRate(): void {
    this.specsRate = +(document.getElementById('specsRate') as HTMLInputElement).value;
    this.ganttsRate = +(document.getElementById('ganttsRate') as HTMLInputElement).value;
    this.outputRate = +(document.getElementById('outputRate') as HTMLInputElement).value;
    this.finalRate = (this.specsRate + this.ganttsRate + this.outputRate) / 3;
  }

  evaluate(): void {
    this.isSaving = true;
    const newEvaluation = this.createEvaluation();
    this.evaluationService.create(newEvaluation).subscribe(
      evaluation => {
        for (const usr of this.groupUsers) {
          usr.evaluationId = evaluation.body.id;
          this.userExtraService.update(usr).subscribe();
        }
      },
      () => this.onSaveError()
    );
  }

  private createEvaluation(): IEvaluation {
    return {
      ...new Evaluation(),
      noteCDC: this.specsRate,
      noteRendu: this.outputRate,
      noteSoutenance: this.ganttsRate,
      noteFinale: this.finalRate
    };
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  previousState(): void {
    window.history.back();
  }
}
