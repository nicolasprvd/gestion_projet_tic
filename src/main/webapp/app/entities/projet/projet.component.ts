import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiDataUtils, JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IProjet } from 'app/shared/model/projet.model';
import { ProjetService } from './projet.service';
import { ProjetDeleteDialogComponent } from './projet-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { UserService } from 'app/core/user/user.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { Authority } from 'app/shared/constants/authority.constants';
import * as moment from 'moment';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { IUserExtra, UserExtra } from 'app/shared/model/user-extra.model';
import { Groupe } from 'app/shared/model/groupe.model';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { IUser } from 'app/core/user/user.model';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';

@Component({
  selector: 'jhi-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.scss']
})
export class ProjetComponent implements OnInit, OnDestroy {
  allProjets?: IProjet[];
  datesArchive: number[];
  isReset: boolean;
  isSaving = false;
  account: Account | null;
  typeUtilisateur: TypeUtilisateur;
  authorities: string[] | undefined;
  groupeId: number;
  projetChoisiId: number;
  eventSubscriber: Subscription;
  currentSearch: string;
  accountExtra: UserExtra;
  groupes: Groupe[] = [];
  isRetracte: boolean;
  extras: IUserExtra[] = [];
  users: IUser[] = [];
  L3: TypeCursus = TypeCursus.L3;
  M1: TypeCursus = TypeCursus.M1;
  M2: TypeCursus = TypeCursus.M2;
  projets: IProjet[];
  projetsAffiches: IProjet[];
  mesProjets = false;
  niveauSelectionne: TypeCursus = null;

  constructor(
    protected projetService: ProjetService,
    protected dataUtils: JhiDataUtils,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService,
    private groupeService: GroupeService,
    private toastrService: ToastrService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';
  }

  loadAll(): void {
    this.isRetracte = false;
    this.isReset = false;
    if (this.currentSearch) {
      this.projetService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IProjet[]>) => (this.projets = res.body || []));
      return;
    }
    if (this.accountExtra.cursus !== null) {
      this.projetService.findByArchiveAndCursus(false, this.accountExtra.cursus).subscribe(projets => {
        if (projets !== null && projets.body !== null) {
          this.projets = projets.body;
          this.allProjets = projets.body;
          this.projetsAffiches = projets.body;
        }
      });
    } else {
      this.projetService.query().subscribe((res: HttpResponse<IProjet[]>) => {
        this.datesArchive = [];
        this.projets = [];
        res.body.forEach(projet => {
          const date = moment(projet.dateCreation);
          const archive = projet.archive;
          if (date.year() === moment().year() && !archive) {
            this.projets.push(projet);
          }
          if (archive) {
            this.datesArchive.push(date.year());
          }
        });
        this.projetsAffiches = this.projets;
        this.datesArchive = [...new Set(this.datesArchive)];
        this.datesArchive = this.datesArchive.sort((a, b) => (a > b ? -1 : 1));
      });
    }
  }

  /**
   * Load projects list from date
   * @param value
   */
  changeProjets(value: number): void {
    this.projetService.query().subscribe((res: HttpResponse<IProjet[]>) => {
      this.projets = [];
      this.projetsAffiches = [];
      this.allProjets = res.body;
      const annee: number = +value;
      let date = 0;
      this.allProjets.forEach(projet => {
        date = +moment(projet.dateCreation).year();
        if (date === annee && projet.archive) {
          this.projets.push(projet);
          this.projetsAffiches.push(projet);
        }
      });
    });
  }

  /**
   * Reset select list date
   */
  reset(): void {
    this.isReset = true;
  }

  search(query: string): void {
    this.currentSearch = query;
    this.loadAll();
  }

  ngOnInit(): void {
    this.registerChangeInProjets();
    this.accountService.getAuthenticationState().subscribe(account => {
      if (account !== null) {
        this.account = account;
        this.authorities = account.authorities;
      }
    });
    this.userExtraService.find(this.account.id).subscribe(userExtra => {
      if (userExtra !== null) {
        this.typeUtilisateur = userExtra.body.typeUtilisateur;
        this.accountExtra = userExtra.body;
        this.groupeId = userExtra.body.groupeId;
        if (this.groupeId != null) {
          this.groupeService.find(this.groupeId).subscribe(groupe => {
            if (groupe !== null) {
              this.projetChoisiId = groupe.body.projetId;
            }
          });
        }
        this.loadAll();
      }
    });
    this.groupeService.findByActif(true).subscribe(groupes => {
      if (groupes !== null && groupes.body !== null) {
        this.groupes = groupes.body;
      }
    });
    this.userExtraService.findByActif(true).subscribe(extras => {
      if (extras !== null && extras.body !== null) {
        this.extras = extras.body;
      }
    });
    this.userService.findByActivated(true).subscribe(users => {
      if (users !== null) {
        this.users = users;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: IProjet): number {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return item.id!;
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(contentType: string, base64String: string): void {
    return this.dataUtils.openFile(contentType, base64String);
  }

  registerChangeInProjets(): void {
    this.eventSubscriber = this.eventManager.subscribe('projetListModification', () => this.loadAll());
  }

  delete(projet: IProjet): void {
    const modalRef = this.modalService.open(ProjetDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.projet = projet;
    modalRef.componentInstance.groupes = this.groupes;
    modalRef.componentInstance.extras = this.extras;
    modalRef.componentInstance.users = this.users;
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
      return projet.userExtraId === this.accountExtra.id;
    }
    return false;
  }

  /**
   * Return true if the current user is an administrator
   */
  isAdmin(): boolean {
    if (this.authorities !== null && this.authorities !== undefined) {
      for (const droit of this.authorities) {
        if (Authority.ADMIN === droit) {
          return true;
        }
      }
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
    return projet.id === this.projetChoisiId;
  }

  /**
   * Allows a group to retract from a project
   * - deletion of the group in the Group table
   * - modify the group id of each user (extra) to set it to null
   */
  retractation(): void {
    this.projetService.find(this.projetChoisiId).subscribe(projet => {
      let compteur = projet.body.nbEtudiant;
      const idMonGroupe: number = this.groupeId;
      this.userExtraService.findByGroupeId(idMonGroupe).subscribe(
        userextras => {
          if (userextras !== null && userextras.body !== null) {
            for (const userextra of userextras.body) {
              userextra.groupeId = null;
              this.userExtraService.update(userextra).subscribe(() => {
                compteur--;
                if (compteur === 0) {
                  this.groupeService.delete(idMonGroupe).subscribe(() => {
                    this.isRetracte = true;
                    this.isSaving = false;
                    this.toastrService.success(
                      this.translateService.instant('global.toastr.retractation.projet.message'),
                      this.translateService.instant('global.toastr.retractation.projet.title', { nom: projet.body.nom })
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
   * Take over archive project
   * @param projet
   */
  reprise(projet: IProjet): void {
    this.reset();
    projet.archive = false;
    projet.dateCreation = moment();
    this.projetService.update(projet).subscribe(
      () => {
        this.toastrService.success(
          this.translateService.instant('global.toastr.reprise.projet.message'),
          this.translateService.instant('global.toastr.reprise.projet.title', { nom: projet.nom })
        );
        this.loadAll();
      },
      () => {
        this.isSaving = false;
        this.toastrService.error(
          this.translateService.instant('global.toastr.erreur.message'),
          this.translateService.instant('global.toastr.erreur.title')
        );
      }
    );
  }

  previousState(): void {
    window.location.reload();
  }

  /**
   * Return true if :
   * - the current user is an administrator
   * - the current project is archived AND does not have a group
   * @param projet
   */
  isAffiche(projet: IProjet): boolean {
    if (this.isAdmin() || this.isClient()) {
      return true;
    }
    if (!projet.archive) {
      return !projet.groupeId;
    }

    return false;
  }

  formatNom(str: string): string {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getClient(projetId: number): string {
    if (this.projets !== null && this.projets !== undefined) {
      for (const projet of this.projets) {
        if (projetId === projet.id) {
          if (this.users !== null && this.users !== undefined) {
            for (const usr of this.users) {
              if (usr.id === projet.userExtraId) {
                return this.formatNom(usr.firstName) + ' ' + usr.lastName.toUpperCase();
              }
            }
          }
        }
      }
    }
    return '';
  }

  filtrerProjetsParCursus(niveau: TypeCursus): void {
    this.niveauSelectionne = niveau;
    this.projetsAffiches = [];
    if (this.mesProjets) {
      for (const projet of this.projets) {
        if (projet.userExtraId === this.accountExtra.id && projet.cursus === niveau) {
          this.projetsAffiches.push(projet);
        }
      }
    } else {
      for (const projet of this.projets) {
        if (projet.cursus === niveau) {
          this.projetsAffiches.push(projet);
        }
      }
    }
    this.modifierCouleurBoutonFiltre(niveau);
  }

  filtrerProjetsSansCursus(): void {
    this.niveauSelectionne = null;
    this.projetsAffiches = [];
    this.modifierCouleurBoutonFiltre(this.niveauSelectionne);
    if (this.mesProjets) {
      for (const projet of this.projets) {
        if (projet.userExtraId === this.accountExtra.id) {
          this.projetsAffiches.push(projet);
        }
      }
    } else {
      this.projetsAffiches = this.projets;
    }
  }

  switchMesProjets(): void {
    this.mesProjets = !this.mesProjets;
    this.changerCouleurBoutonMesProjets();
    if (this.niveauSelectionne === null) {
      this.filtrerProjetsSansCursus();
    } else {
      this.filtrerProjetsParCursus(this.niveauSelectionne);
    }
  }

  changerCouleurBoutonMesProjets(): void {
    if (this.mesProjets) {
      document.getElementById('filtreMesProjets').setAttribute('class', 'btn btn-info btn-sm');
    } else {
      document.getElementById('filtreMesProjets').setAttribute('class', 'btn btn-secondary btn-sm');
    }
  }

  modifierCouleurBoutonFiltre(niveau: TypeCursus): void {
    document.getElementById('filtreAucun').setAttribute('class', 'btn btn-secondary btn-sm');
    document.getElementById('filtreL3').setAttribute('class', 'btn btn-secondary btn-sm');
    document.getElementById('filtreM1').setAttribute('class', 'btn btn-secondary btn-sm');
    document.getElementById('filtreM2').setAttribute('class', 'btn btn-secondary btn-sm');
    if (niveau === null) {
      document.getElementById('filtreAucun').setAttribute('class', 'btn btn-success btn-sm');
    } else if (niveau === TypeCursus.L3) {
      document.getElementById('filtreL3').setAttribute('class', 'btn btn-success btn-sm');
    } else if (niveau === TypeCursus.M1) {
      document.getElementById('filtreM1').setAttribute('class', 'btn btn-success btn-sm');
    } else {
      document.getElementById('filtreM2').setAttribute('class', 'btn btn-success btn-sm');
    }
  }
}
