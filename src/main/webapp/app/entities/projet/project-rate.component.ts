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
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

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
  idEvaluation: number;
  evaluation: IEvaluation;

  constructor(
    protected dataUtils: JhiDataUtils,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService,
    private documentService: DocumentService,
    private http: HttpClient,
    private evaluationService: EvaluationService,
    private router: Router,
    private toastrService: ToastrService,
    private translateService: TranslateService
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
            if (extra.evaluationId !== null) {
              this.idEvaluation = extra.evaluationId;
            } else {
              this.idEvaluation = undefined;
            }
          }
        }
        if (this.idEvaluation !== undefined) {
          this.evaluationService.find(this.idEvaluation).subscribe(evaluation => {
            this.evaluation = evaluation.body;
          });
        }
      }
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  calculateFinalRate(): void {
    this.specsRate = +(+(document.getElementById('specsRate') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.ganttsRate = +(+(document.getElementById('ganttsRate') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.outputRate = +(+(document.getElementById('outputRate') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    if (this.isValidate()) {
      this.finalRate = +((this.specsRate + this.ganttsRate + this.outputRate) / 3).toFixed(2);
    }
  }

  evaluate(): void {
    if (this.isValidate()) {
      this.isSaving = true;
      if (this.idEvaluation !== undefined) {
        const newEvaluation = this.createEvaluation(false);
        this.evaluationService.update(newEvaluation).subscribe(
          () => {
            this.isSaving = false;
            this.toastrService.success(
              this.translateService.instant('global.toastr.noter.projet.messageUpdate'),
              this.translateService.instant('global.toastr.noter.projet.title', { nom: this.project.nom })
            );
            this.router.navigate(['/projet']);
          },
          () => {
            this.isSaving = false;
            this.toastrService.error(
              this.translateService.instant('global.toastr.erreur.message'),
              this.translateService.instant('global.toastr.erreur.title')
            );
          }
        );
      } else {
        const newEvaluation = this.createEvaluation(true);
        this.evaluationService.create(newEvaluation).subscribe(
          evaluation => {
            this.isSaving = false;
            for (const usr of this.groupUsers) {
              usr.evaluationId = evaluation.body.id;
              this.userExtraService.update(usr).subscribe();
            }
            this.toastrService.success(
              this.translateService.instant('global.toastr.noter.projet.message'),
              this.translateService.instant('global.toastr.noter.projet.title', { nom: this.project.nom })
            );
            this.router.navigate(['/projet']);
          },
          () => {
            this.isSaving = false;
            this.toastrService.error(
              this.translateService.instant('global.toastr.erreur.message'),
              this.translateService.instant('global.toastr.erreur.title')
            );
          }
        );
      }
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

  private createEvaluation(create: boolean): IEvaluation {
    return {
      ...new Evaluation(),
      id: create ? undefined : this.idEvaluation,
      noteCDC: this.specsRate,
      noteRendu: this.outputRate,
      noteSoutenance: this.ganttsRate,
      noteFinale: this.finalRate,
      actif: true
    };
  }

  previousState(): void {
    window.history.back();
  }

  openFile(docContentType: string, doc: string): void {
    this.dataUtils.openFile(docContentType, doc);
  }
}
