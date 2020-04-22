import { Component } from '@angular/core';
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
  projet?: IProjet;
  groupes: Groupe[] = [];
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

  confirmDelete(id: number): void {
    for (const groupe of this.groupes) {
      if (groupe.projetId === id) {
        for (const extra of this.extras) {
          if (extra.groupeId === groupe.id) {
            extra.groupeId = null;
            this.userExtraService.update(extra).subscribe();
            this.envoiMailProjetSupprime(extra.id);
          }
        }
        this.groupeService.delete(groupe.id).subscribe();
      }
    }
    this.projetService.delete(id).subscribe(
      () => {
        this.eventManager.broadcast('projetListModification');
        this.activeModal.close();
        this.toastrService.success(
          this.translateService.instant('global.toastr.suppressions.projet.message'),
          this.translateService.instant('global.toastr.suppressions.projet.title', { nom: this.projet.nom })
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

  envoiMailProjetSupprime(extra: number): void {
    console.error(this.users.length + ' id extra : ' + extra);
    for (const u of this.users) {
      if (u.id === extra) {
        this.subject = 'Réponse négative attribution du projet';
        this.content =
          'Le projet ' +
          this.projet.nom +
          " n'a pas été attribué à votre groupe car il a été supprimé. Veuillez vous rendre sur le site pour en choisir un autre.";
        this.projetService.sendMail(u.email, this.subject, this.content).subscribe();
      }
    }
  }
}
