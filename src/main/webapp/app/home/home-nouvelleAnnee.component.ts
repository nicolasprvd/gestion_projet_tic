import { Component, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IProjet } from 'app/shared/model/projet.model';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { IDocument } from 'app/shared/model/document.model';
import { IEvaluation } from 'app/shared/model/evaluation.model';
import { IGroupe } from 'app/shared/model/groupe.model';
import { IUser } from 'app/core/user/user.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { EvaluationService } from 'app/entities/evaluation/evaluation.service';
import { UserService } from 'app/core/user/user.service';
import { DocumentService } from 'app/entities/document/document.service';
import { Account } from 'app/core/user/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { Router } from '@angular/router';
import { ProjetService } from 'app/entities/projet/projet.service';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';

@Component({
  templateUrl: './home-nouvelleAnnee.component.html'
})
export class HomeNouvelleAnneeComponent {
  isSaving = false;
  isDesactive = false;
  account: Account | null = null;
  userExtras: IUserExtra[] = [];
  documents: IDocument[] = [];
  evaluations: IEvaluation[] = [];
  groupes: IGroupe[] = [];
  users: IUser[] = [];
  projets: IProjet[] = [];
  passEntry: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    public activeModal: NgbActiveModal,
    protected eventManager: JhiEventManager,
    private toastrService: ToastrService,
    private translateService: TranslateService,
    private accountService: AccountService,
    private router: Router,
    private userExtraService: UserExtraService,
    private groupeService: GroupeService,
    private evaluationService: EvaluationService,
    private userService: UserService,
    private documentService: DocumentService,
    private projetService: ProjetService
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  nouvelleAnnee(): void {
    this.isSaving = true;
    for (const groupe of this.groupes) {
      groupe.actif = false;
      this.groupeService.update(groupe).subscribe(() => {
        this.isDesactive = true;
      });
    }
    for (const evaluation of this.evaluations) {
      evaluation.actif = false;
      this.evaluationService.update(evaluation).subscribe(() => {
        this.isDesactive = true;
      });
    }
    for (const document of this.documents) {
      document.actif = false;
      this.documentService.update(document).subscribe(() => {
        this.isDesactive = true;
      });
    }
    for (const projet of this.projets) {
      projet.archive = true;
      this.projetService.update(projet).subscribe(() => {
        this.isDesactive = true;
      });
    }
    for (const extra of this.userExtras) {
      if (extra.typeUtilisateur === TypeUtilisateur.ETUDIANT) {
        if (extra.cursus === TypeCursus.M2) {
          const usr = this.getUserById(extra.id);
          extra.actif = false;
          usr.activated = false;
          this.userService.update(usr).subscribe(() => {
            this.isDesactive = true;
          });
        }
        if (extra.cursus === TypeCursus.M1) {
          extra.cursus = TypeCursus.M2;
        }
        if (extra.cursus === TypeCursus.L3) {
          extra.cursus = TypeCursus.M1;
        }
        this.userExtraService.update(extra).subscribe(() => {
          this.isDesactive = true;
          this.onSaveSuccess();
        });
        this.isDesactive = false;
      }
    }
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.activeModal.close();
    this.sendMessage();
    this.router.navigate(['/']);
  }

  private sendMessage(): void {
    this.passEntry.emit(true);
  }

  private getUserById(id: number): IUser {
    for (const usr of this.users) {
      if (usr.id === id) {
        return usr;
      }
    }
    return null;
  }
}
