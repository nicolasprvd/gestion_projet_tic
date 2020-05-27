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
  filteredGroups: IGroupe[] = [];
  validGroup = false;
  eventSubscriber?: Subscription;
  currentSearch: string;
  projects: IProjet[] = [];
  users: IUser[] = [];
  userExtras: IUserExtra[] = [];
  L3: TypeCursus = TypeCursus.L3;
  M1: TypeCursus = TypeCursus.M1;
  M2: TypeCursus = TypeCursus.M2;
  selectedGrade: TypeCursus;

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
        this.filteredGroups = groupes.body;
        this.validGroup = this.isValidGroup();
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
        this.projects = projets;
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

  delete(group: IGroupe): void {
    const modalRef = this.modalService.open(GroupeDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.groupe = group;
  }

  /**
   * Return the project name
   * @param projectId
   */
  getProjectName(projectId: number): string {
    if (this.projects !== null && this.projects !== undefined) {
      for (const project of this.projects) {
        if (project.id === projectId) {
          return project.nom;
        }
      }
    }
    return '';
  }

  /**
   * Return the name of the project manager
   * @param user
   */
  getProjectChief(user: number): string {
    if (this.users !== null && this.users !== undefined) {
      for (const usr of this.users) {
        if (usr.id === user) {
          return this.formatName(usr.firstName) + ' ' + usr.lastName.toUpperCase();
        }
      }
    }
    return '';
  }

  /**
   * Format the name
   * entry : aaaaaaa
   * return : Aaaaaaa
   * @param str
   */
  formatName(str: string): string {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Return the name of the user
   * @param extra
   */
  getuserName(extra: IUserExtra): string {
    if (this.users !== null && this.users !== undefined) {
      for (const usr of this.users) {
        if (usr.id === extra.id) {
          return this.formatName(usr.firstName) + ' ' + usr.lastName.toUpperCase();
        }
      }
    }
    return '';
  }

  /**
   * Return the name of the project's customer
   * @param projectId
   */
  getCustomer(projectId: number): string {
    if (this.projects !== null && this.projects !== undefined) {
      for (const project of this.projects) {
        if (projectId === project.id) {
          if (this.users !== null && this.users !== undefined) {
            for (const usr of this.users) {
              if (usr.id === project.userExtraId) {
                return this.formatName(usr.firstName) + ' ' + usr.lastName.toUpperCase();
              }
            }
          }
        }
      }
    }
    return '';
  }

  /**
   * Return true if the user is a team member
   * @param extra
   * @param group
   */
  isGroupMember(extra: IUserExtra, group: IGroupe): boolean {
    return group.id === extra?.groupeId;
  }

  /**
   * Return true if the user is the team chief
   * @param extra
   * @param group
   */
  isChief(extra: IUserExtra, group: IGroupe): boolean {
    return group.userExtraId === extra.id;
  }

  /**
   * Generate the csv file based on the html table
   */
  export(): void {
    const table = document.getElementById('data') as HTMLTableElement;
    let data = '';
    let fileName = '';
    let fileNameGrade;
    if (this.selectedGrade === null || this.selectedGrade === undefined) {
      fileNameGrade = this.L3 + '_' + this.M1 + '_' + this.M2;
    } else {
      fileNameGrade = this.selectedGrade.toString();
    }
    if (this.translate.currentLang === this.translate.getLangs()[0]) {
      data = 'Projet;Client;Chef de projet;Membres';
      fileName = fileNameGrade + '_groupes_projet_miage.csv';
    } else {
      data = 'Project;Customer;Project manager;Members';
      fileName = fileNameGrade + '_groups_miage_project.csv';
    }
    if (table !== null) {
      const rows = table.rows;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const members = this.removeSpaces(row.cells[3].textContent);
        data =
          data +
          '\r\n' +
          row.cells[0].textContent.trim() +
          ';' +
          row.cells[1].textContent.trim() +
          ';' +
          row.cells[2].textContent.trim() +
          ';' +
          members;
      }
      const blob = new Blob([data], { type: 'type/txt' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }

  /**
   * Remove space before, after and into the string
   * @param str
   */
  removeSpaces(str: string): string {
    let hasSpace = true;
    str = str.trim();
    while (hasSpace) {
      str = str.replace(/[ \t]{2,}/, ' - ');
      hasSpace = str.includes('  ');
    }
    return str;
  }

  /**
   * Filter groups by grade
   * @param grade
   */
  filterGroups(grade: TypeCursus): void {
    this.selectedGrade = grade;
    this.filteredGroups = [];
    for (const group of this.groupes) {
      if (group.cursus === grade) {
        this.filteredGroups.push(group);
      }
    }
    this.changeColorFilterButton(grade);
  }

  /**
   * Remove all grade filter, display all groups
   */
  reinitGroupsFilter(): void {
    this.selectedGrade = null;
    this.filteredGroups = this.groupes;
    this.changeColorFilterButton(null);
  }

  /**
   * Reinit all button's color and change the pushed button color with a different
   * @param grade
   */
  changeColorFilterButton(grade: TypeCursus): void {
    document.getElementById('filtreAucun').setAttribute('class', 'btn btn-danger btn-sm');
    document.getElementById('filtreL3').setAttribute('class', 'btn btn-danger btn-sm');
    document.getElementById('filtreM1').setAttribute('class', 'btn btn-danger btn-sm');
    document.getElementById('filtreM2').setAttribute('class', 'btn btn-danger btn-sm');
    if (grade === null) {
      document.getElementById('filtreAucun').setAttribute('class', 'btn btn-success btn-sm');
    } else if (grade === TypeCursus.L3) {
      document.getElementById('filtreL3').setAttribute('class', 'btn btn-success btn-sm');
    } else if (grade === TypeCursus.M1) {
      document.getElementById('filtreM1').setAttribute('class', 'btn btn-success btn-sm');
    } else {
      document.getElementById('filtreM2').setAttribute('class', 'btn btn-success btn-sm');
    }
  }

  /**
   * Return true if a group is valid
   */
  private isValidGroup(): boolean {
    for (const group of this.groupes) {
      if (group.valide === true) {
        return true;
      }
    }
    return false;
  }
}
