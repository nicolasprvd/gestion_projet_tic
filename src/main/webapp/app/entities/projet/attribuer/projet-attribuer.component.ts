import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProjet } from 'app/shared/model/projet.model';
import { ActivatedRoute } from '@angular/router';
import { Groupe } from 'app/shared/model/groupe.model';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.model';
import { UserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';

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

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected groupeService: GroupeService,
    protected userService: UserService,
    protected userExtraService: UserExtraService
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
                }); /** Fin userService*/
              }
            }
          }); /** Fin userExtraService*/
        }
      }
    }); /** Fin groupeService*/
  }

  /**
   * Return to the previous page
   */
  previousState(): void {
    window.history.back();
  }

  ngOnDestroy(): void {}
}
