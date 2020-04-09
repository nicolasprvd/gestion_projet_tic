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
import { UserExtra } from 'app/shared/model/user-extra.model';

@Component({
  selector: 'jhi-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.scss']
})
export class ProjetComponent implements OnInit, OnDestroy {
  allProjets?: IProjet[];
  accountExtraId!: number;
  datesArchive: number[];
  isReset: boolean;
  isSaving = false;
  account: Account | null;
  typeUtilisateur: TypeUtilisateur;
  projets: IProjet[];
  authorities: string[] | undefined;
  groupeId: number;
  projetChoisiId: number;
  eventSubscriber: Subscription;
  currentSearch: string;
  accountExtra: UserExtra;

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
    private router: Router
  ) {
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';
  }

  loadAll(): void {
    this.isReset = false;
    if (this.currentSearch) {
      this.projetService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IProjet[]>) => (this.projets = res.body || []));
      return;
    }

    this.projetService.query().subscribe((res: HttpResponse<IProjet[]>) => {
      this.datesArchive = [];
      this.projets = [];
      res.body.forEach(projet => {
        const date = moment(projet.dateCreation);
        const archive = projet.archive;
        if (date.year() === moment().year() && !archive) {
          this.projets.push(projet);
        }
        this.datesArchive.push(date.year());
      });

      this.datesArchive = [...new Set(this.datesArchive)];
      this.datesArchive = this.datesArchive.sort((a, b) => (a > b ? -1 : 1));
    });
  }

  changeProjets(value: number): void {
    this.projetService.query().subscribe((res: HttpResponse<IProjet[]>) => {
      this.projets = [];
      this.allProjets = res.body;
      const annee: number = +value;
      let date = 0;
      this.allProjets.forEach(projet => {
        date = +moment(projet.dateCreation).year();
        if (date === annee && projet.archive) {
          this.projets.push(projet);
        }
      });
    });
  }

  reset(): void {
    this.isReset = true;
  }

  search(query: string): void {
    this.currentSearch = query;
    this.loadAll();
  }

  ngOnInit(): void {
    this.loadAll();

    this.registerChangeInProjets();
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
      this.authorities = account.authorities;
    });
    this.userExtraService.find(this.account.id).subscribe(userExtra => {
      this.typeUtilisateur = userExtra.body.typeUtilisateur;
      this.accountExtra = userExtra.body;
      this.groupeId = userExtra.body.groupeId;
      if (this.groupeId != null) {
        this.groupeService.find(this.groupeId).subscribe(groupe => {
          this.projetChoisiId = groupe.body.projetId;
        });
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
  }

  /**
   * Return true if the current user is a CLIENT
   */
  isClient(): boolean {
    return this.typeUtilisateur === TypeUtilisateur.CLIENT;
  }

  /**
   * Return true if :
   * - the current user is an administrator
   * - the project was created by the current user
   */
  isAutorise(projet: IProjet): boolean {
    for (const droit of this.authorities) {
      if (Authority.ADMIN === droit) {
        return true;
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
    for (const droit of this.authorities) {
      if (Authority.ADMIN === droit) {
        return true;
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
      const idMonGroupe: number = this.accountExtra.groupeId;
      this.userExtraService.findAll().subscribe(
        userextras => {
          this.groupeService.delete(idMonGroupe).subscribe();
          for (const userextra of userextras) {
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
        },
        () => this.onSaveError()
      );
    });
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  previousState(): void {
    window.location.reload();
  }
}
