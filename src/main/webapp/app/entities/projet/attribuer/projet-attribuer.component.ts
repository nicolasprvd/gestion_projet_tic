import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProjet } from 'app/shared/model/projet.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Groupe } from 'app/shared/model/groupe.model';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.model';
import { UserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { ProjetService } from 'app/entities/projet/projet.service';
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'jhi-projet-attribuer',
  templateUrl: './projet-attribuer.component.html',
  styleUrls: ['./projet-attribuer.scss']
})
export class ProjetAttribuerComponent implements OnInit, OnDestroy {
  projet?: IProjet;
  groupes: Groupe[] = [];
  usersExtra: UserExtra[] = [];
  users: User[] = [];
  isSaving = false;
  subject: string;
  content: string;

  constructor(
    protected projetService: ProjetService,
    protected activatedRoute: ActivatedRoute,
    protected groupeService: GroupeService,
    protected userService: UserService,
    protected userExtraService: UserExtraService,
    protected router: Router,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => (this.projet = projet));
    this.groupeService.findByActif(true).subscribe(groupes => {
      if (groupes !== null && groupes.body !== null) {
        for (const g of groupes.body) {
          if (g.projetId === this.projet.id) {
            this.groupes.push(g);

            this.userExtraService.findByActif(true).subscribe(usersExtra => {
              if (usersExtra !== null && usersExtra.body !== null) {
                for (const ue of usersExtra.body) {
                  if (ue.groupeId === g.id) {
                    this.usersExtra.push(ue);

                    this.userService.findAll().subscribe(users => {
                      if (users !== null) {
                        for (const u of users) {
                          if (u.id === ue.userId) {
                            this.users.push(u);
                          }
                        }
                      }
                    }); // Fin userService
                  }
                }
              }
            }); // Fin userExtraService
          }
        }
      }
    }); // Fin groupeService
  }

  /**
   * Return to the previous page
   */
  previousState(): void {
    window.history.back();
  }

  envoiMailNonChoisi(idChefProjet: number): void {
    for (const u of this.users) {
      if (u.id === idChefProjet) {
        this.subject = 'Réponse negative attribution du projet';
        this.content =
          'Le projet ' +
          this.projet.nom +
          " n'a pas été attribué à votre groupe. Veuillez-vous rendre sur le site pour en choisir un autre.";
        this.projetService.sendMail(u.email, this.subject, this.content).subscribe();
      }
    }
  }

  envoieMailChoisi(idUser: number): void {
    for (const u of this.users) {
      if (u.id === idUser) {
        this.subject = 'Réponse positive attribution du projet';
        this.content = 'Le projet ' + this.projet.nom + ' a bien été attribué à votre groupe.';
        this.projetService.sendMail(u.email, this.subject, this.content).subscribe();
      }
    }
  }

  /**
   * Allows a client to apply a group from a project
   * - modify the group id of each user (extra) to set it to null (for all groups not apply)
   * - deletion of all groups not apply in the Group table
   * - modify tha attribute validate in the group table to the idGroupeChoisit
   * - modify the group id in the projet table with the idGroupeChoisit
   */
  attribution(idGroupeChoisit: number): void {
    // 1) modify the group id of each user (extra) to set it to null (for all groups not apply)
    for (const ue of this.usersExtra) {
      if (ue.groupeId !== idGroupeChoisit) {
        this.envoiMailNonChoisi(ue.userId);
        ue.groupeId = null;
        this.userExtraService.update(ue).subscribe();
      } else {
        this.envoieMailChoisi(ue.userId);
      }
    }

    // 2) deletion of all groups not apply in the Group table
    // 3) modify tha attribute validate in the group table to the idGroupeChoisit
    for (const g of this.groupes) {
      // 2) deletion
      if (g.id !== idGroupeChoisit) {
        this.groupeService.delete(g.id).subscribe();
      }
      // 3) update valide = true
      else {
        g.valide = true;
        this.groupeService.update(g).subscribe();
      }
    }

    // 4) modify the group id in the projet table with the idGroupeChoisit
    this.projet.groupeId = idGroupeChoisit;
    this.projetService.update(this.projet).subscribe(() => {
        this.toastrService.success(
          this.translateService.instant('global.toastr.attribuer.projet.message'),
          this.translateService.instant('global.toastr.attribuer.projet.title', { nom: this.projet.nom })
        );
      // Return project page
      this.router.navigate(['/projet']);
    },
      () => {
        this.toastrService.error(
          this.translateService.instant('global.toastr.erreur.message'),
          this.translateService.instant('global.toastr.erreur.title')
        );
      });
  }

  ngOnDestroy(): void {}
}
