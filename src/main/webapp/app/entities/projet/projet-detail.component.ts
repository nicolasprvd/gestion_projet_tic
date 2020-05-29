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
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'jhi-projet-detail',
  templateUrl: './projet-detail.component.html',
  styleUrls: ['./projet.scss']
})
export class ProjetDetailComponent implements OnInit {
  isSaving = false;
  project: IProjet;
  account: Account | null;
  authorities: string[] | undefined;
  groupId: number;
  user: IUser;
  users: IUser[];
  customer: IUser;
  userExtras: IUserExtra[];
  userType: TypeUtilisateur;
  login: string | undefined;
  myProjectId: number;
  groups: Groupe[] = [];
  chiefGroupId: number;
  isRetracted: boolean;

  constructor(
    protected dataUtils: JhiDataUtils,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService,
    private groupeService: GroupeService,
    private projetService: ProjetService,
    private router: Router,
    private translate: TranslateService,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ project }) => (this.project = project));
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
            this.userType = userExtra.typeUtilisateur;
            this.groupId = userExtra.groupeId;
            if (this.groupId !== null && this.groupId !== undefined) {
              this.groupeService.find(this.groupId).subscribe(group => {
                this.myProjectId = group.body.projetId;
              });
            }
          }
          if (userExtra.id === this.project?.userExtraId) {
            this.userService.findById(userExtra.userId).subscribe(customer => {
              if (customer !== null) {
                customer.firstName = this.formatName(customer.firstName);
                customer.lastName = customer.lastName.toUpperCase();
                this.customer = customer;
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
    this.groupeService.findByActif(true).subscribe(groups => {
      if (groups !== null && groups.body !== null) {
        this.groups = groups.body;
        for (const grp of groups.body) {
          if (grp.projetId === this.project.id) {
            this.chiefGroupId = grp.userExtraId;
          }
        }
      }
    });
    this.isRetracted = false;
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
  isCustomer(): boolean {
    return this.userType === TypeUtilisateur.CLIENT;
  }

  /**
   * Return true students have apply to this project
   */
  isSelected(projectId: number): boolean {
    if (this.groups !== null && this.groups !== undefined) {
      for (const g of this.groups) {
        if (g.projetId === projectId) {
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
  isAuthorized(project: IProjet): boolean {
    if (this.authorities !== null && this.authorities !== undefined) {
      for (const authority of this.authorities) {
        if (Authority.ADMIN === authority) {
          return true;
        }
      }
    }
    if (this.isCustomer()) {
      return project.userExtraId === this.account.id;
    }
    return false;
  }

  /**
   * Return true if the current user have a group
   */
  alreadyHasGroup(): boolean {
    return this.groupId !== null;
  }

  /**
   * Return true if the param project is the current user's project
   * @param project
   */
  isMyProject(project: IProjet): boolean {
    return project.id === this.myProjectId;
  }

  /**
   * Allows a group to retract from a project
   * - deletion of the group in the Group table
   * - modify the group id of each user (extra) to set it to null
   */
  retract(): void {
    this.projetService.find(this.myProjectId).subscribe(project => {
      let counter = project.body.nbEtudiant;
      const myGroupId: number = this.groupId;
      this.userExtraService.findByGroupeId(myGroupId).subscribe(
        extras => {
          if (extras !== null && extras.body !== null) {
            for (const extra of extras.body) {
              extra.groupeId = null;
              this.userExtraService.update(extra).subscribe(() => {
                counter--;
                if (counter === 0) {
                  this.groupeService.delete(myGroupId).subscribe(() => {
                    this.isRetracted = true;
                    this.isSaving = false;
                    this.toastrService.success(
                      this.translateService.instant('global.toastr.retractation.projet.message'),
                      this.translateService.instant('global.toastr.retractation.projet.title', { nom: project.body.nom })
                    );
                    this.router.navigate(['/projet']);
                  });
                }
              });
            }
          }
        },
        () => {
          this.isSaving = false;
          this.toastrService.error(
            this.translateService.instant('global.toastr.erreur.message'),
            this.translateService.instant('global.toastr.erreur.title')
          );
        }
      );
    });
  }

  /**
   * Return true if the project has a text description
   * @param project
   */
  isTextDescription(project: IProjet): boolean {
    return project.descriptionTexte !== null && project.descriptionTexte !== '';
  }

  /**
   * Return true if the project has a PDF description
   * @param project
   */
  isPDFDescription(project: IProjet): boolean {
    return project.descriptionPDF !== null;
  }

  /**
   * Return the firstname and lastname of the user
   * @param extra
   */
  getFirstnameLastname(extra: IUserExtra): string {
    if (this.users !== null && this.users !== undefined) {
      for (const usr of this.users) {
        if (usr.id === extra.id) {
          if (this.chiefGroupId === extra.id) {
            return (
              this.translate.instant('projetticApp.projet.detail.chefDeProjet') +
              ' : ' +
              this.formatName(usr.firstName) +
              ' ' +
              usr.lastName.toUpperCase()
            );
          }
          return this.formatName(usr.firstName) + ' ' + usr.lastName.toUpperCase();
        }
      }
    }
    return '';
  }

  formatName(str: string): string {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
