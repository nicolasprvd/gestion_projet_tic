import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { Authority } from 'app/shared/constants/authority.constants';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { Router } from '@angular/router';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { DocumentService } from 'app/entities/document/document.service';
import { IDocument } from 'app/shared/model/document.model';
import { IEvaluation } from 'app/shared/model/evaluation.model';
import { IGroupe } from 'app/shared/model/groupe.model';
import { IUser } from 'app/core/user/user.model';
import { IProjet } from 'app/shared/model/projet.model';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { EvaluationService } from 'app/entities/evaluation/evaluation.service';
import { UserService } from 'app/core/user/user.service';
import { ProjetService } from 'app/entities/projet/projet.service';
import { HomeNouvelleAnneeComponent } from 'app/home/home-nouvelleAnnee.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  isSaving = false;
  isDesactive: boolean;
  account: Account | null = null;
  authSubscription?: Subscription;
  userExtras: IUserExtra[] = [];
  documents: IDocument[] = [];
  evaluations: IEvaluation[] = [];
  groupes: IGroupe[] = [];
  users: IUser[] = [];
  projets: IProjet[] = [];

  constructor(
    private accountService: AccountService,
    private userExtraService: UserExtraService,
    private groupeService: GroupeService,
    private evaluationService: EvaluationService,
    private userService: UserService,
    private documentService: DocumentService,
    private projetService: ProjetService,
    private router: Router,
    private modalService: NgbModal,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
      if (this.accountService.isAuthenticated()) {
        this.userExtraService.findByActif(true).subscribe(userExtras => {
          if (userExtras !== null && userExtras.body !== null) {
            this.userExtras = userExtras.body;
          }
        });
        this.documentService.findByActif(true).subscribe(documents => {
          if (documents !== null && documents.body !== null) {
            this.documents = documents.body;
          }
        });
        this.evaluationService.findByActif(true).subscribe(evaluations => {
          if (evaluations !== null && evaluations.body !== null) {
            this.evaluations = evaluations.body;
          }
        });
        this.userService.findByActivated(true).subscribe(users => {
          if (users !== null) {
            this.users = users;
          }
        });
        this.groupeService.findByActif(true).subscribe(groupes => {
          if (groupes !== null && groupes.body !== null) {
            this.groupes = groupes.body;
          }
        });
        this.projetService.findByArchive(false).subscribe(projets => {
          if (projets !== null && projets.body !== null) {
            this.projets = projets.body;
          }
        });
        this.isDesactive = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  isAdmin(): boolean {
    if (this.account === null || this.account.authorities === null) {
      return false;
    }
    for (const droit of this.account.authorities) {
      if (Authority.ADMIN === droit) {
        return true;
      }
    }
    return false;
  }

  nouvelleAnnee(): void {
    const modalRef = this.modalService.open(HomeNouvelleAnneeComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.account = this.account;
    modalRef.componentInstance.userExtras = this.userExtras;
    modalRef.componentInstance.documents = this.documents;
    modalRef.componentInstance.evaluations = this.evaluations;
    modalRef.componentInstance.groupes = this.groupes;
    modalRef.componentInstance.users = this.users;
    modalRef.componentInstance.projets = this.projets;
    modalRef.componentInstance.isDesactive = this.isDesactive;
    modalRef.componentInstance.passEntry.subscribe((value: boolean) => {
      this.isDesactive = value;
      this.toastrService.success(
        this.translateService.instant('global.toastr.nouvelleAnnee.message'),
        this.translateService.instant('global.toastr.nouvelleAnnee.title'),
      );
    });
  }

  isEvaluationActif(): boolean {
    return this.evaluations && this.evaluations.length > 0;
  }
}
