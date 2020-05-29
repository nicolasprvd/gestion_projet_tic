import {Component} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IProjet } from 'app/shared/model/projet.model';
import { ProjetService } from './projet.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { Groupe } from 'app/shared/model/groupe.model';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { IUser } from 'app/core/user/user.model';

@Component({
  templateUrl: './projet-delete-dialog.component.html'
})
export class ProjetDeleteDialogComponent {
  project?: IProjet;
  groups: Groupe[] = [];
  extras: IUserExtra[] = [];
  users: IUser[] = [];
  subject: string;
  content: string;

  constructor(
    protected projetService: ProjetService,
    public activeModal: NgbActiveModal,
    protected eventManager: JhiEventManager,
    private toastrService: ToastrService,
    private translateService: TranslateService,
    private groupeService: GroupeService,
    private userExtraService: UserExtraService
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  /**
   * Archive the project and delete the group that applied for it
   * @param id
   */
  deleteProject(id: number): void {
    for (const group of this.groups) {
      if (group.projetId === id) {
        for (const extra of this.extras) {
          if (extra.groupeId === group.id) {
            extra.groupeId = null;
            this.userExtraService.update(extra).subscribe();
            this.sendEmailProjectDeleted(extra.id);
          }
        }
        this.groupeService.delete(group.id).subscribe();
      }
    }
    this.projetService.delete(id).subscribe(
      () => {
        this.eventManager.broadcast('projetListModification');
        this.activeModal.close();
        this.toastrService.success(
          this.translateService.instant('global.toastr.suppressions.projet.message'),
          this.translateService.instant('global.toastr.suppressions.projet.title', { nom: this.project.nom })
        );
      },
      () => {
        this.toastrService.error(
          this.translateService.instant('global.toastr.erreur.message'),
          this.translateService.instant('global.toastr.erreur.title')
        );
      }
    );
  }

  /**
   * Send an email to all members of the deleted group
   * @param extra
   */
  sendEmailProjectDeleted(extra: number): void {
    for (const u of this.users) {
      if (u.id === extra) {
        this.subject = this.translateService.instant('global.email.suppressionProjet.sujet');
        this.content = this.translateService.instant('global.email.suppressionProjet.message', { nom: this.project.nom });
        this.projetService.sendMail(u.email, this.subject, this.content).subscribe();
      }
    }
  }
}
