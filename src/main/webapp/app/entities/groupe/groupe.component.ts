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
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-groupe',
  templateUrl: './groupe.component.html',
  styleUrls: ['./groupe.scss']
})
export class GroupeComponent implements OnInit, OnDestroy {
  groupes?: IGroupe[];
  eventSubscriber?: Subscription;
  currentSearch: string;
  projets: IProjet[] = [];
  users: IUser[] = [];
  userExtras: IUserExtra[] = [];

  constructor(
    protected groupeService: GroupeService,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute,
    protected projetService: ProjetService,
    protected userService: UserService,
    protected userExtraService: UserExtraService,
    protected translate: TranslateService
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
        return this.formatNom(usr.firstName) + ' ' + usr.lastName.toUpperCase();
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
        return this.formatNom(usr.firstName) + ' ' + usr.lastName.toUpperCase();
      }
    }
    return '';
  }

  getClient(projetId: number): string {
    for (const projet of this.projets) {
      if (projetId === projet.id) {
        for (const usr of this.users) {
          if (usr.id === projet.userExtraId) {
            return this.formatNom(usr.firstName) + ' ' + usr.lastName.toUpperCase();
          }
        }
      }
    }
    return '';
  }

  isMembreGroupe(extra: IUserExtra, groupe: IGroupe): boolean {
    return groupe.id === extra?.groupeId;
  }

  isChef(extra: IUserExtra, groupe: IGroupe): boolean {
    return groupe.userExtraId === extra.id;
  }

  exporter(): void {
    const table = document.getElementById('data') as HTMLTableElement;
    let donnees = '';
    let nomFichier = '';
    if (this.translate.currentLang === this.translate.getLangs()[0]) {
      donnees = 'Projet,Client,Chef de projet,Membres';
      nomFichier = 'groupes_projet_tic.csv';
    } else {
      donnees = 'Project,Customer,Project manager,Members';
      nomFichier = 'groups_tic_project.csv';
    }
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const membres = this.retraitEspaces(row.cells[3].textContent);
      donnees =
        donnees +
        '\r\n' +
        row.cells[0].textContent.trim() +
        ',' +
        row.cells[1].textContent.trim() +
        ',' +
        row.cells[2].textContent.trim() +
        ',' +
        membres;
    }
    const blob = new Blob([donnees], { type: 'type/txt' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  retraitEspaces(str: string): string {
    let retraitEspace = true;
    str = str.trim();
    while (retraitEspace) {
      str = str.replace(/[ \t]{2,}/, ' - ');
      retraitEspace = str.includes('  ');
    }
    return str;
  }
}
