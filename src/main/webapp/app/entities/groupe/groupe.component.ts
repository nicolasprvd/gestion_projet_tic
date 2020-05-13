import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';

@Component({
  selector: 'jhi-groupe',
  templateUrl: './groupe.component.html',
  styleUrls: ['./groupe.scss']
})
export class GroupeComponent implements OnInit, OnDestroy {
  groupes?: IGroupe[];
  groupesFiltres: IGroupe[] = [];
  eventSubscriber?: Subscription;
  currentSearch: string;
  projets: IProjet[] = [];
  users: IUser[] = [];
  userExtras: IUserExtra[] = [];
  L3: TypeCursus = TypeCursus.L3;
  M1: TypeCursus = TypeCursus.M1;
  M2: TypeCursus = TypeCursus.M2;
  cursusSelectionne: TypeCursus;

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
    this.groupeService.findByActif(true).subscribe(groupes => {
      if (groupes !== null && groupes.body !== null) {
        this.groupes = groupes.body;
        this.groupesFiltres = groupes.body;
      }
    });
  }

  search(query: string): void {
    this.currentSearch = query;
    this.loadAll();
  }

  ngOnInit(): void {
    this.loadAll();
    this.registerChangeInGroupes();
    this.projetService.findAll().subscribe(projets => {
      if (projets !== null) {
        this.projets = projets;
      }
    });
    this.userService.findByActivated(true).subscribe(users => {
      if (users !== null) {
        this.users = users;
      }
    });
    this.userExtraService.findByActif(true).subscribe(userExtras => {
      if (userExtras !== null) {
        this.userExtras = userExtras.body;
      }
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
    if (this.projets !== null && this.projets !== undefined) {
      for (const projet of this.projets) {
        if (projet.id === projetId) {
          return projet.nom;
        }
      }
    }
    return '';
  }

  getChefProjet(user: number): string {
    if (this.users !== null && this.users !== undefined) {
      for (const usr of this.users) {
        if (usr.id === user) {
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

  getMembreProjet(extra: IUserExtra): string {
    if (this.users !== null && this.users !== undefined) {
      for (const usr of this.users) {
        if (usr.id === extra.id) {
          return this.formatNom(usr.firstName) + ' ' + usr.lastName.toUpperCase();
        }
      }
    }
    return '';
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
    let cursusTitre;
    if (this.cursusSelectionne === null || this.cursusSelectionne === undefined) {
      cursusTitre = this.L3 + '_' + this.M1 + '_' + this.M2;
    } else {
      cursusTitre = this.cursusSelectionne.toString();
    }
    if (this.translate.currentLang === this.translate.getLangs()[0]) {
      donnees = 'Projet;Client;Chef de projet;Membres';
      nomFichier = cursusTitre + '_groupes_projet_tic.csv';
    } else {
      donnees = 'Project;Customer;Project manager;Members';
      nomFichier = cursusTitre + '_groups_tic_project.csv';
    }
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const membres = this.retraitEspaces(row.cells[3].textContent);
      donnees =
        donnees +
        '\r\n' +
        row.cells[0].textContent.trim() +
        ';' +
        row.cells[1].textContent.trim() +
        ';' +
        row.cells[2].textContent.trim() +
        ';' +
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

  filtrerGroupes(niveau: TypeCursus): void {
    this.cursusSelectionne = niveau;
    this.groupesFiltres = [];
    for (const groupe of this.groupes) {
      if (groupe.cursus === niveau) {
        this.groupesFiltres.push(groupe);
      }
    }
    this.modifierCouleurBoutonFiltre(niveau);
  }

  reinitFiltreGroupes(): void {
    this.cursusSelectionne = null;
    this.groupesFiltres = this.groupes;
    this.modifierCouleurBoutonFiltre(null);
  }

  modifierCouleurBoutonFiltre(niveau: TypeCursus): void {
    document.getElementById('filtreAucun').setAttribute('class', 'btn btn-danger btn-sm');
    document.getElementById('filtreL3').setAttribute('class', 'btn btn-danger btn-sm');
    document.getElementById('filtreM1').setAttribute('class', 'btn btn-danger btn-sm');
    document.getElementById('filtreM2').setAttribute('class', 'btn btn-danger btn-sm');
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
