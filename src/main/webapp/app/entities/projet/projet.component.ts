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
  archiveDates: number[];
  isReset: boolean;
  isSaving = false;
  account: Account | null;
  userType: TypeUtilisateur;
  authorities: string[] | undefined;
  groupId: number;
  selectedProjectId: number;
  eventSubscriber: Subscription;
  currentSearch: string;
  accountExtra: UserExtra;
  groups: Groupe[] = [];
  isRetracted: boolean;
  extras: IUserExtra[] = [];
  users: IUser[] = [];
  L3: TypeCursus = TypeCursus.L3;
  M1: TypeCursus = TypeCursus.M1;
  M2: TypeCursus = TypeCursus.M2;
  projects: IProjet[];
  displayedProjects: IProjet[] = [];
  displayMyProjects = false;
  gradeSelected: TypeCursus = null;

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

  /**
   * Load all projects and setup archive variables
   */
  loadAll(): void {
    this.isRetracted = false;
    this.isReset = false;
    if (this.currentSearch) {
      this.projetService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IProjet[]>) => (this.projects = res.body || []));
      return;
    }
    if (this.accountExtra.cursus !== null) {
      this.projetService.findByArchiveAndCursus(false, this.accountExtra.cursus).subscribe(projects => {
        if (projects !== null && projects.body !== null) {
          this.projects = projects.body;
          this.allProjets = projects.body;
          for (const project of projects.body) {
            if (project.groupeId === null) {
              this.displayedProjects.push(project);
            }
          }
        }
      });
    } else {
      this.projetService.query().subscribe((res: HttpResponse<IProjet[]>) => {
        this.archiveDates = [];
        this.projects = [];
        res.body.forEach(project => {
          const date = moment(project.dateCreation);
          const archive = project.archive;
          if (date.year() === moment().year() && !archive) {
            this.projects.push(project);
          }
          if (archive) {
            this.archiveDates.push(date.year());
          }
        });
        this.displayedProjects = this.projects;
        this.archiveDates = [...new Set(this.archiveDates)];
        this.archiveDates = this.archiveDates.sort((a, b) => (a > b ? -1 : 1));
      });
    }
  }

  /**
   * Load projects list from date
   * @param value
   */
  changeProjects(value: number): void {
    this.projetService.query().subscribe((res: HttpResponse<IProjet[]>) => {
      this.projects = [];
      this.displayedProjects = [];
      this.allProjets = res.body;
      const year: number = +value;
      let date = 0;
      this.allProjets.forEach(project => {
        date = +moment(project.dateCreation).year();
        if (date === year && project.archive) {
          this.projects.push(project);
          this.displayedProjects.push(project);
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
        this.userType = userExtra.body.typeUtilisateur;
        this.accountExtra = userExtra.body;
        this.groupId = userExtra.body.groupeId;
        if (this.groupId != null) {
          this.groupeService.find(this.groupId).subscribe(group => {
            if (group !== null) {
              this.selectedProjectId = group.body.projetId;
            }
          });
        }
        this.loadAll();
      }
    });
    this.groupeService.findByActif(true).subscribe(groups => {
      if (groups !== null && groups.body !== null) {
        this.groups = groups.body;
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

  /**
   * Open the popup project-delete.component.ts file in order to delete a project
   * @param project
   */
  delete(project: IProjet): void {
    const modalRef = this.modalService.open(ProjetDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.project = project;
    modalRef.componentInstance.groups = this.groups;
    modalRef.componentInstance.extras = this.extras;
    modalRef.componentInstance.users = this.users;
  }

  /**
   * Return true if the current user is a CLIENT
   */
  isCustomer(): boolean {
    return this.userType === TypeUtilisateur.CLIENT;
  }

  /**
   * Return true if a group have apply to this project
   */
  isChoosenByGroup(idProject: number): boolean {
    if (this.groups !== null && this.groups !== undefined) {
      for (const g of this.groups) {
        if (g.projetId === idProject) {
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
  isAllowed(project: IProjet, rated: boolean): boolean {
    if (this.isAdmin() && rated) {
      return true;
    }
    if (this.isCustomer()) {
      return project.userExtraId === this.accountExtra.id;
    }
    return false;
  }

  /**
   * Return true if the current user is an administrator
   */
  isAdmin(): boolean {
    if (this.authorities !== null && this.authorities !== undefined) {
      for (const authority of this.authorities) {
        if (Authority.ADMIN === authority) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Return true if the current user has a group
   */
  alreadyHasGroup(): boolean {
    return this.groupId !== null;
  }

  /**
   * Return true if the param project is the current user's project
   * @param project
   */
  isMySelectedProject(project: IProjet): boolean {
    return project.id === this.selectedProjectId;
  }

  /**
   * Allows a group to retract from a project
   * - deletion of the group in the Group table
   * - modify the group id of each user (extra) to set it to null
   */
  retract(): void {
    this.projetService.find(this.selectedProjectId).subscribe(project => {
      let counter = project.body.nbEtudiant;
      const myGroupId: number = this.groupId;
      this.userExtraService.findByGroupeId(myGroupId).subscribe(
        userextras => {
          if (userextras !== null && userextras.body !== null) {
            for (const userextra of userextras.body) {
              userextra.groupeId = null;
              this.userExtraService.update(userextra).subscribe(() => {
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
   * Take over archive project
   * @param project
   */
  recovery(project: IProjet): void {
    this.reset();
    project.archive = false;
    project.dateCreation = moment();
    this.projetService.update(project).subscribe(
      () => {
        this.toastrService.success(
          this.translateService.instant('global.toastr.reprise.projet.message'),
          this.translateService.instant('global.toastr.reprise.projet.title', { nom: project.nom })
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
   * @param project
   */
  isDisplayed(project: IProjet): boolean {
    if (this.isAdmin() || this.isCustomer()) {
      return true;
    }
    if (!project.archive) {
      return !project.groupeId;
    }

    return false;
  }

  /**
   * Format the name
   * param : aaaaaaa
   * return : Aaaaaaa
   * @param str
   */
  formatName(str: string): string {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Return the name of the customer of the project
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
   * Add all projects of the grade param into displayedProjects variable
   * @param grade
   */
  filterProjectsByGrade(grade: TypeCursus): void {
    this.gradeSelected = grade;
    this.displayedProjects = [];
    if (this.displayMyProjects) {
      for (const project of this.projects) {
        if (project.userExtraId === this.accountExtra.id && project.cursus === grade) {
          this.displayedProjects.push(project);
        }
      }
    } else {
      for (const project of this.projects) {
        if (project.cursus === grade) {
          this.displayedProjects.push(project);
        }
      }
    }
    this.changeColorsFilterButtons(grade);
  }

  /**
   * Add all projects into displayedProjects variable
   */
  filterProjectsWithoutGrade(): void {
    this.gradeSelected = null;
    this.displayedProjects = [];
    this.changeColorsFilterButtons(this.gradeSelected);
    if (this.displayMyProjects) {
      for (const project of this.projects) {
        if (project.userExtraId === this.accountExtra.id) {
          this.displayedProjects.push(project);
        }
      }
    } else {
      this.displayedProjects = this.projects;
    }
  }

  /**
   * Add all my projects or all projects into displayedProjects variable, based on displayMyProjects variable
   * Change the displayMyProjects boolean value
   */
  filterMyProjects(): void {
    this.displayMyProjects = !this.displayMyProjects;
    this.changeColorMyProjectsButton();
    if (this.gradeSelected === null) {
      this.filterProjectsWithoutGrade();
    } else {
      this.filterProjectsByGrade(this.gradeSelected);
    }
  }

  /**
   * Change the color of My Project button if pushed or not
   */
  changeColorMyProjectsButton(): void {
    if (this.displayMyProjects) {
      document.getElementById('filtreMesProjets').setAttribute('class', 'btn btn-success btn-sm');
    } else {
      document.getElementById('filtreMesProjets').setAttribute('class', 'btn btn-secondary btn-sm');
    }
  }

  /**
   * Change the color of filter buttons if pushed or not
   * @param grade
   */
  changeColorsFilterButtons(grade: TypeCursus): void {
    document.getElementById('filtreAucun').setAttribute('class', 'btn btn-secondary btn-sm');
    document.getElementById('filtreL3').setAttribute('class', 'btn btn-secondary btn-sm');
    document.getElementById('filtreM1').setAttribute('class', 'btn btn-secondary btn-sm');
    document.getElementById('filtreM2').setAttribute('class', 'btn btn-secondary btn-sm');
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
}
