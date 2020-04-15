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
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => (this.projet = projet));
    this.groupeService.findAll().subscribe(groupes => {
      for (const g of groupes) {
        if (g.projetId === this.projet.id) {
          this.groupes.push(g);

          this.userExtraService.findAll().subscribe(usersExtra => {
            for (const ue of usersExtra) {
              if (ue.groupeId === g.id) {
                this.usersExtra.push(ue);

                this.userService.findAll().subscribe(users => {
                  for (const u of users) {
                    if (u.id === ue.userId) {
                      this.users.push(u);
                    }
                  }
                }); // Fin userService
              }
            }
          }); // Fin userExtraService
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

  envoieMailChoisi(idChefProjet: number): void {
    for (const u of this.users) {
      if (u.id === idChefProjet) {
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
        ue.groupeId = null;
        this.userExtraService.update(ue).subscribe();
      }
    }

    // 2) deletion of all groups not apply in the Group table
    // 3) modify tha attribute validate in the group table to the idGroupeChoisit
    for (const g of this.groupes) {
      // 2) deletion
      if (g.id !== idGroupeChoisit) {
        this.envoiMailNonChoisi(g.userExtraId);
        this.groupeService.delete(g.id).subscribe();
      }
      // 3) update valide = true
      else {
        this.envoieMailChoisi(g.userExtraId);
        g.valide = true;
        this.groupeService.update(g).subscribe();
      }
    }

    // 4) modify the group id in the projet table with the idGroupeChoisit
    this.projet.groupeId = idGroupeChoisit;
    this.projetService.update(this.projet).subscribe(() => {
      // Return project page
      this.router.navigate(['/projet']);
    });
  }

  ngOnDestroy(): void {}
}
