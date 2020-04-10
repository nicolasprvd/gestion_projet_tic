import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IGroupe } from 'app/shared/model/groupe.model';
import { GroupeService } from './groupe.service';
import { GroupeDeleteDialogComponent } from './groupe-delete-dialog.component';
import { ProjetService } from 'app/entities/projet/projet.service';
import { IProjet } from 'app/shared/model/projet.model';
import { UserService } from 'app/core/user/user.service';
import { IUser } from 'app/core/user/user.model';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';

@Component({
  selector: 'jhi-groupe',
  templateUrl: './groupe.component.html'
})
export class GroupeComponent implements OnInit, OnDestroy {
  groupes?: IGroupe[];
  eventSubscriber?: Subscription;
  currentSearch: string;
  projets: IProjet[];
  users: IUser[];
  userExtras: IUserExtra[];

  constructor(
    protected groupeService: GroupeService,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute,
    protected projetService: ProjetService,
    protected userService: UserService,
    protected userExtraService: UserExtraService
  ) {
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';
  }

  loadAll(): void {
    if (this.currentSearch) {
      this.groupeService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IGroupe[]>) => (this.groupes = res.body || []));
      return;
    }

    this.groupeService.query().subscribe((res: HttpResponse<IGroupe[]>) => (this.groupes = res.body || []));
  }

  search(query: string): void {
    this.currentSearch = query;
    this.loadAll();
  }

  ngOnInit(): void {
    this.loadAll();
    this.registerChangeInGroupes();
    this.projetService.findAll().subscribe(projets => {
      this.projets = projets;
    });
    this.userService.findAll().subscribe(users => {
      this.users = users;
    });
    this.userExtraService.findAll().subscribe(userExtras => {
      this.userExtras = userExtras;
    });
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: IGroupe): number {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return item.id!;
  }

  registerChangeInGroupes(): void {
    this.eventSubscriber = this.eventManager.subscribe('groupeListModification', () => this.loadAll());
  }

  delete(groupe: IGroupe): void {
    const modalRef = this.modalService.open(GroupeDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.groupe = groupe;
  }

  getNomProjet(projetId: number): string {
    for (const projet of this.projets) {
      if (projet.id === projetId) {
        return projet.nom;
      }
    }
    return '';
  }

  getChefProjet(user: number): string {
    for (const usr of this.users) {
      if (usr.id === user) {
        return this.formatNom(usr.firstName) + ' ' + this.formatNom(usr.lastName);
      }
    }
    return '';
  }

  formatNom(str: string): string {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getMembreProjet(extra: IUserExtra): string {
    for (const usr of this.users) {
      if (usr.id === extra.id) {
        return this.formatNom(usr.firstName) + ' ' + this.formatNom(usr.lastName);
      }
    }
    return '';
  }

  isMembreGroupe(extra: IUserExtra, groupe: IGroupe): boolean {
    return groupe.id === extra.groupeId;
  }

  isChef(extra: IUserExtra, groupe: IGroupe): boolean {
    return groupe.userExtraId === extra.id;
  }
}
