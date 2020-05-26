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
import { TypeDocument } from 'app/shared/model/enumerations/type-document.model';
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
  specsDoc: IDocument = null;
  ganttDoc: IDocument = null;
  outputDoc: IDocument = null;
  ratingId: number;
  specsRate = 0;
  specsCoef = 1;
  ganttRate = 0;
  ganttCoef = 1;
  outputRate = 0;
  outputCoef = 1;
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

    this.documentService.findByProjetId(this.project.id).subscribe(documents => {
      if (documents !== null) {
        documents.body.forEach(document => {
          this.documentZIP = document;
          this.updateDocument(document);
        });
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
    console.error(this.groupMembers);
  }

  updateDocument(document: IDocument): void {
    this.document.patchValue({
      id: document.id,
      documentZIP: document.doc,
      documentZIPContentType: document.docContentType,
      typeDocument: document.typeDocument,
      projetId: document.projetId
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  /**
   * Calculate the final grade based on the form data
   */
  calculateFinalRate(): void {
    this.specsRate = +(+(document.getElementById('specsRate') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.ganttRate = +(+(document.getElementById('ganttsRate') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.outputRate = +(+(document.getElementById('outputRate') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.specsCoef = +(+(document.getElementById('specsCoef') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.ganttCoef = +(+(document.getElementById('ganttsCoef') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    this.outputCoef = +(+(document.getElementById('outputCoef') as HTMLInputElement).value.replace(',', '.')).toFixed(2);
    if (this.isValidate()) {
      this.finalRate = +(
        (this.specsRate * this.specsCoef + this.ganttRate * this.ganttCoef + this.outputRate * this.outputCoef) /
        (this.outputCoef + this.ganttCoef + this.specsCoef)
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
        console.error(newEvaluation);
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
    document.getElementById('specsRate').setAttribute('style', 'background-color:white');
    document.getElementById('ganttsRate').setAttribute('style', 'background-color:white');
    document.getElementById('outputRate').setAttribute('style', 'background-color:white');
    document.getElementById('specsCoef').setAttribute('style', 'background-color:white');
    document.getElementById('ganttsCoef').setAttribute('style', 'background-color:white');
    document.getElementById('outputCoef').setAttribute('style', 'background-color:white');
    let valid = true;
    if (isNaN(this.specsRate) || this.specsRate < 0 || this.specsRate > 20) {
      document.getElementById('specsRate').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    if (isNaN(this.ganttRate) || this.ganttRate < 0 || this.ganttRate > 20) {
      document.getElementById('ganttsRate').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    if (isNaN(this.outputRate) || this.outputRate < 0 || this.outputRate > 20) {
      document.getElementById('outputRate').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    if (isNaN(this.specsCoef) || this.specsCoef < 0) {
      document.getElementById('specsCoef').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    if (isNaN(this.ganttCoef) || this.ganttCoef < 0) {
      document.getElementById('ganttsCoef').setAttribute('style', 'background-color:#d65959');
      valid = false;
    }
    if (isNaN(this.outputCoef) || this.outputCoef < 0) {
      document.getElementById('outputCoef').setAttribute('style', 'background-color:#d65959');
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
      noteCDC: this.specsRate,
      noteRendu: this.outputRate,
      noteSoutenance: this.ganttRate,
      coefCDC: this.specsCoef,
      coefRendu: this.outputCoef,
      coefSoutenance: this.ganttCoef,
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
