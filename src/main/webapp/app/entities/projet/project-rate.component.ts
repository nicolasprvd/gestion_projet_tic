import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JhiDataUtils } from 'ng-jhipster';

import { IProjet } from 'app/shared/model/projet.model';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/core/user/user.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { DocumentService } from 'app/entities/document/document.service';
import { Account } from 'app/core/user/account.model';
import { Evaluation, IEvaluation } from 'app/shared/model/evaluation.model';
import { HttpClient } from '@angular/common/http';
import { UserExtra } from 'app/shared/model/user-extra.model';
import { EvaluationService } from 'app/entities/evaluation/evaluation.service';
import { IDocument } from 'app/shared/model/document.model';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { IUser } from 'app/core/user/user.model';

@Component({
  selector: 'jhi-projet-detail',
  templateUrl: './project-rate.component.html',
  styleUrls: ['./projet.scss']
})
export class ProjectRateComponent implements OnInit {
  project!: IProjet;
  account!: Account | null;
  groupMembers: UserExtra[] = [];
  groupMembersNames: IUser[] = [];
  groupId: number;
  isSaving = false;
  ratingId: number;
  specificationRate = 0;
  specificationCoef = 1;
  defenseRate = 0;
  defenseCoef = 1;
  reportRate = 0;
  reportCoef = 1;
  finalRate = 0;
  filename: string;
  documentZIP: IDocument = null;

  document = this.fb.group({
    id: [],
    documentZIP: [],
    documentZIPContentType: [],
    typeDocument: [],
    projetId: []
  });

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
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ project }) => (this.project = project));
    this.accountService.getAuthenticationState().subscribe(account => {
      if (account !== null) {
        this.account = account;
      }
    });

    this.documentService.findByProjetId(this.project.id).subscribe(document => {
      if (document !== null) {
        this.documentZIP = document.body;
        this.updateDocument(document.body);
      }
    });

    this.userExtraService.findByActif(true).subscribe(userExtras => {
      if (userExtras !== null) {
        this.groupId = this.project.groupeId;
        for (const extra of userExtras.body) {
          if (extra.groupeId === this.groupId) {
            this.groupMembers.push(extra);
            if (extra.evaluationId !== null) {
              this.ratingId = extra.evaluationId;
            } else {
              this.ratingId = undefined;
            }
          }
        }
      }
      this.userService.findByActivated(true).subscribe(users => {
        if (users != null) {
          for (const member of this.groupMembers) {
            for (const user of users) {
              if (member.id === user.id) {
                this.groupMembersNames.push(user);
              }
            }
          }
        }
      });
    });
    this.evaluationService.findByProjet(this.project.id).subscribe(evaluation => {
      if (evaluation && evaluation.body) {
        this.specificationRate = +evaluation.body.noteCDC;
        this.specificationCoef = +evaluation.body.coefCDC;
        this.defenseRate = +evaluation.body.noteSoutenance;
        this.defenseCoef = +evaluation.body.coefSoutenance;
        this.reportRate = +evaluation.body.noteRendu;
        this.reportCoef = +evaluation.body.coefRendu;
        this.finalRate = +evaluation.body.noteFinale;
      }
    });
  }

  updateDocument(document: IDocument): void {
    this.document.patchValue({
      id: document?.id,
      documentZIP: document?.doc,
      documentZIPContentType: document?.docContentType,
      typeDocument: document?.typeDocument,
      projetId: document?.projetId
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  /**
   * Calculate the final grade based on the form data
   */
  calculateFinalRate(): void {
    this.specificationRate = +(+(document.getElementById('specificationRate') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.defenseRate = +(+(document.getElementById('defenseRate') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.reportRate = +(+(document.getElementById('reportRate') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.specificationCoef = +(+(document.getElementById('specificationCoef') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.defenseCoef = +(+(document.getElementById('defenseCoef') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.reportCoef = +(+(document.getElementById('reportCoef') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    if (this.isValidate()) {
      this.finalRate = +(
        (this.specificationRate * this.specificationCoef + this.defenseRate * this.defenseCoef + this.reportRate * this.reportCoef) /
        (this.reportCoef + this.defenseCoef + this.specificationCoef)
      ).toFixed(2);
    }
  }

  /**
   * Insert a new Evaluation object into the database
   */
  evaluate(): void {
    if (this.isValidate()) {
      this.isSaving = true;
      if (this.ratingId !== undefined) {
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
            for (const usr of this.groupMembers) {
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

  /**
   * Check if form data are valid
   */
  isValidate(): boolean {
    document.getElementById('specificationRate').setAttribute('style', 'background-color:white');
    document.getElementById('defenseRate').setAttribute('style', 'background-color:white');
    document.getElementById('reportRate').setAttribute('style', 'background-color:white');
    document.getElementById('specificationCoef').setAttribute('style', 'background-color:white');
    document.getElementById('defenseCoef').setAttribute('style', 'background-color:white');
    document.getElementById('reportCoef').setAttribute('style', 'background-color:white');
    let valid = true;
    if (isNaN(this.specificationRate) || this.specificationRate < 0 || this.specificationRate > 20) {
      document.getElementById('specificationRate').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    if (isNaN(this.defenseRate) || this.defenseRate < 0 || this.defenseRate > 20) {
      document.getElementById('defenseRate').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    if (isNaN(this.reportRate) || this.reportRate < 0 || this.reportRate > 20) {
      document.getElementById('reportRate').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    if (isNaN(this.specificationCoef) || this.specificationCoef < 0) {
      document.getElementById('specificationCoef').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    if (isNaN(this.defenseCoef) || this.defenseCoef < 0) {
      document.getElementById('defenseCoef').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    if (isNaN(this.reportCoef) || this.reportCoef < 0) {
      document.getElementById('reportCoef').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    return !isNaN(this.finalRate) && this.finalRate >= 0 && this.finalRate <= 20 && valid;
  }

  /**
   * Create an Evaluation object from form data
   * @param create
   */
  private createEvaluation(create: boolean): IEvaluation {
    return {
      ...new Evaluation(),
      id: create ? undefined : this.ratingId,
      noteCDC: this.specificationRate,
      noteRendu: this.reportRate,
      noteSoutenance: this.defenseRate,
      coefCDC: this.specificationCoef,
      coefRendu: this.reportCoef,
      coefSoutenance: this.defenseCoef,
      noteFinale: this.finalRate,
      actif: true,
      cursus: this.project.cursus
    };
  }

  previousState(): void {
    window.history.back();
  }

  openFile(contentType: string, base64String: string): void {
    this.filename = this.project.cursus + '_';
    this.groupMembersNames.forEach(member => {
      this.filename += member.lastName.toUpperCase() + '_';
    });
    this.filename = this.filename.substring(0, this.filename.length - 1);
    return this.dataUtils.downloadFile(contentType, base64String, this.filename);
  }
}
