import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JhiDataUtils } from 'ng-jhipster';

import { IProjet } from 'app/shared/model/projet.model';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/core/user/user.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { Account } from 'app/core/user/account.model';
import { IUser } from 'app/core/user/user.model';
import { Authority } from 'app/shared/constants/authority.constants';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { ProjetService } from 'app/entities/projet/projet.service';
import { Groupe } from 'app/shared/model/groupe.model';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-projet-detail',
  templateUrl: './projet-detail.component.html',
  styleUrls: ['./projet.scss']
})
export class ProjetDetailComponent implements OnInit {
  isSaving = false;
  projet: IProjet;
  account: Account | null;
  authorities: string[] | undefined;
  groupeId: number;
  user: IUser;
  users: IUser[];
  client: IUser;
  userExtras: IUserExtra[];
  typeUtilisateur: TypeUtilisateur;
  login: string | undefined;
  monProjetId: number;
  groupes: Groupe[] = [];
  chefGroupeId: number;

  constructor(
    protected dataUtils: JhiDataUtils,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService,
    private groupeService: GroupeService,
    private projetService: ProjetService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => (this.projet = projet));
    this.accountService.getAuthenticationState().subscribe(account => {
      if (account !== null) {
        this.account = account;
        this.authorities = account.authorities;
      }
    });
    this.userExtraService.findByActif(true).subscribe(userExtras => {
      if (userExtras !== null && userExtras.body !== null) {
        this.userExtras = userExtras.body;
        for (const userExtra of this.userExtras) {
          if (this.account.id === userExtra.id) {
            this.typeUtilisateur = userExtra.typeUtilisateur;
            this.groupeId = userExtra.groupeId;
            if (this.groupeId !== null && this.groupeId !== undefined) {
              this.groupeService.find(this.groupeId).subscribe(groupe => {
                this.monProjetId = groupe.body.projetId;
              });
            }
          }
          if (userExtra.id === this.projet?.userExtraId) {
            this.userService.findById(userExtra.userId).subscribe(client => {
              if (client !== null) {
                client.firstName = this.formatNom(client.firstName);
                client.lastName = client.lastName.toUpperCase();
                this.client = client;
              }
            });
          }
        }
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
        for (const grp of groupes.body) {
          if (grp.projetId === this.projet.id) {
            this.chefGroupeId = grp.userExtraId;
          }
        }
      }
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(contentType: string, base64String: string): void {
    this.dataUtils.openFile(contentType, base64String);
  }

  /**
   * Return to the previous page
   */
  previousState(): void {
    window.history.back();
  }

  /**
   * Return true if the current user is a CLIENT
   */
  isClient(): boolean {
    return this.typeUtilisateur === TypeUtilisateur.CLIENT;
  }

  /**
   * Return true studients have apply to this project
   */
  isChoisi(idProjet: number): boolean {
    if (this.groupes !== null && this.groupes !== undefined) {
      for (const g of this.groupes) {
        if (g.projetId === idProjet) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Return true if :
   * - the current user is an administrator
   * - the project was created by the current user
   */
  isAutorise(projet: IProjet): boolean {
    if (this.authorities !== null && this.authorities !== undefined) {
      for (const droit of this.authorities) {
        if (Authority.ADMIN === droit) {
          return true;
        }
      }
    }
    if (this.isClient()) {
      return projet.userExtraId === this.account.id;
    }
    return false;
  }

  /**
   * Return true if the current user have a group
   */
  aDejaUnGroupe(): boolean {
    return this.groupeId !== null;
  }

  /**
   * Return true if the param project is the current user's project
   * @param projet
   */
  isMonProjetChoisi(projet: IProjet): boolean {
    return projet.id === this.monProjetId;
  }

  /**
   * Allows a group to retract from a project
   * - deletion of the group in the Group table
   * - modify the group id of each user (extra) to set it to null
   */
  retractation(): void {
    this.projetService.find(this.monProjetId).subscribe(projet => {
      let compteur = projet.body.nbEtudiant;
      const idMonGroupe: number = this.groupeId;
      this.userExtraService.findByActif(true).subscribe(
        userextras => {
          if (userextras !== null && userextras.body !== null) {
            this.groupeService.delete(idMonGroupe).subscribe();
            for (const userextra of userextras.body) {
              if (userextra.groupeId === idMonGroupe) {
                userextra.groupeId = null;
                compteur--;
                this.userExtraService.update(userextra).subscribe(() => {
                  if (compteur === 0) {
                    this.onSaveSuccess();
                  }
                });
              }
            }
          }
        },
        () => this.onSaveError()
      );
    });
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.router.navigate(['/projet']);
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  isDescriptionTexte(projet: IProjet): boolean {
    return projet.descriptionTexte !== null && projet.descriptionTexte !== '';
  }

  isDescriptionPDF(projet: IProjet): boolean {
    return projet.descriptionPDF !== null;
  }

  getNomPrenomUser(extra: IUserExtra): string {
    if (this.users !== null && this.users !== undefined) {
      for (const usr of this.users) {
        if (usr.id === extra.id) {
          if (this.chefGroupeId === extra.id) {
            return (
              this.translate.instant('projetticApp.projet.detail.chefDeProjet') +
              ' : ' +
              this.formatNom(usr.firstName) +
              ' ' +
              usr.lastName.toUpperCase()
            );
          }
          return this.formatNom(usr.firstName) + ' ' + usr.lastName.toUpperCase();
        }
      }
    }
    return '';
  }

  formatNom(str: string): string {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
