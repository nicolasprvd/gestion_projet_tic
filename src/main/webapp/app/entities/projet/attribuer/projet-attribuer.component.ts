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
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-projet-attribuer',
  templateUrl: './projet-attribuer.component.html',
  styleUrls: ['./projet-attribuer.scss']
})
export class ProjetAttribuerComponent implements OnInit, OnDestroy {
  project?: IProjet;
  groups: Groupe[] = [];
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
    this.activatedRoute.data.subscribe(({ project }) => (this.project = project));
    this.groupeService.findByActif(true).subscribe(groups => {
      if (groups !== null && groups.body !== null) {
        for (const g of groups.body) {
          if (g.projetId === this.project.id) {
            this.groups.push(g);

            this.userExtraService.findByActif(true).subscribe(extras => {
              if (extras !== null && extras.body !== null) {
                for (const extra of extras.body) {
                  if (extra.groupeId === g.id) {
                    this.usersExtra.push(extra);

                    this.userService.findByActivated(true).subscribe(users => {
                      if (users !== null) {
                        for (const user of users) {
                          if (user.id === extra.userId) {
                            this.users.push(user);
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

  /**
   * Send email at no apply group (all groups received the email)
   */
  sendNegativeAnswerEmail(userId: number): void {
    if (this.users !== null && this.users !== undefined) {
      for (const user of this.users) {
        if (user.id === userId) {
          this.subject = this.translateService.instant('global.email.assignProject.negative.subject');
          this.content = this.translateService.instant('global.email.assignProject.negative.content', { nom: this.project.nom });
          this.projetService.sendMail(user.email, this.subject, this.content).subscribe();
        }
      }
    }
  }

  /**
   * Send email at  apply group (all groups received the email)
   */
  sendPositiveAnswerEmail(userId: number): void {
    if (this.users !== null && this.users !== undefined) {
      for (const user of this.users) {
        if (user.id === userId) {
          this.subject = this.translateService.instant('global.email.assignProject.positive.subject');
          this.content = this.translateService.instant('global.email.assignProject.positive.content', { nom: this.project.nom });
          this.projetService.sendMail(user.email, this.subject, this.content).subscribe();
        }
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
  assign(selectedGroupId: number): void {
    if (this.usersExtra !== null && this.usersExtra !== undefined) {
      for (const ue of this.usersExtra) {
        if (ue.groupeId !== selectedGroupId) {
          this.sendNegativeAnswerEmail(ue.userId);
          ue.groupeId = null;
          this.userExtraService.update(ue).subscribe();
        } else {
          this.sendPositiveAnswerEmail(ue.userId);
        }
      }
    }
    if (this.groups !== null && this.groups !== undefined) {
      for (const g of this.groups) {
        if (g.id !== selectedGroupId) {
          this.groupeService.delete(g.id).subscribe();
        } else {
          g.valide = true;
          this.groupeService.update(g).subscribe();
        }
      }
    }

    this.project.groupeId = selectedGroupId;
    this.projetService.update(this.project).subscribe(
      () => {
        this.toastrService.success(
          this.translateService.instant('global.toastr.attribuer.projet.message'),
          this.translateService.instant('global.toastr.attribuer.projet.title', { nom: this.project.nom })
        );
        this.router.navigate(['/projet']);
      },
      () => {
        this.toastrService.error(
          this.translateService.instant('global.toastr.erreur.message'),
          this.translateService.instant('global.toastr.erreur.title')
        );
      }
    );
  }

  ngOnDestroy(): void {}
}
