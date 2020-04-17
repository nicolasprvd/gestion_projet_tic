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
import { IDocument } from 'app/shared/model/document.model';
import { TypeDocument } from 'app/shared/model/enumerations/type-document.model';

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
  cdcDoc: IDocument = null;
  ganttDoc: IDocument = null;
  renduDoc: IDocument = null;

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
      if (account !== null) {
        this.account = account;
        this.authorities = account.authorities;
      }
    });
    this.documentService.findByProjetId(this.project.id).subscribe(documents => {
      if (documents !== null) {
        for (const doc of documents.body) {
          if (doc.typeDocument === TypeDocument.CDC) {
            this.cdcDoc = doc;
          }
          if (doc.typeDocument === TypeDocument.GANTT) {
            this.ganttDoc = doc;
          }
          if (doc.typeDocument === TypeDocument.RF) {
            this.renduDoc = doc;
          }
        }
      }
    });
    this.userExtraService.findByActif(true).subscribe(userExtras => {
      if (userExtras !== null) {
        this.groupId = this.project.groupeId;
        this.allUsers = userExtras.body;
        for (const extra of this.allUsers) {
          if (extra.groupeId === this.groupId) {
            this.groupUsers.push(extra);
          }
        }
      }
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  calculateFinalRate(): void {
    this.specsRate = +(document.getElementById('specsRate') as HTMLInputElement).value.replace(',', '.');
    this.ganttsRate = +(document.getElementById('ganttsRate') as HTMLInputElement).value.replace(',', '.');
    this.outputRate = +(document.getElementById('outputRate') as HTMLInputElement).value.replace(',', '.');
    if (this.isValidate()) {
      this.finalRate = +((this.specsRate + this.ganttsRate + this.outputRate) / 3).toFixed(2);
    }
  }

  evaluate(): void {
    if (this.isValidate()) {
      this.isSaving = true;
      const newEvaluation = this.createEvaluation();
      this.evaluationService.create(newEvaluation).subscribe(
        evaluation => {
          for (const usr of this.groupUsers) {
            usr.evaluationId = evaluation.body.id;
            this.userExtraService.update(usr).subscribe();
          }
          this.router.navigate(['/projet']);
        },
        () => this.onSaveError()
      );
    }
  }

  isValidate(): boolean {
    document.getElementById('specsRate').setAttribute('style', 'background-color:white');
    document.getElementById('ganttsRate').setAttribute('style', 'background-color:white');
    document.getElementById('outputRate').setAttribute('style', 'background-color:white');
    let valide = true;
    if (isNaN(this.specsRate) || this.specsRate < 0 || this.specsRate > 20) {
      document.getElementById('specsRate').setAttribute('style', 'background-color:#d65959');
      valide = false;
    }
    if (isNaN(this.ganttsRate) || this.ganttsRate < 0 || this.ganttsRate > 20) {
      document.getElementById('ganttsRate').setAttribute('style', 'background-color:#d65959');
      valide = false;
    }
    if (isNaN(this.outputRate) || this.outputRate < 0 || this.outputRate > 20) {
      document.getElementById('outputRate').setAttribute('style', 'background-color:#d65959');
      valide = false;
    }
    return !isNaN(this.finalRate) && this.finalRate >= 0 && this.finalRate <= 20 && valide;
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

  openFile(docContentType: string, doc: string): void {
    this.dataUtils.openFile(docContentType, doc);
  }
}
