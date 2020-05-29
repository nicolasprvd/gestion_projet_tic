import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IEvaluation } from 'app/shared/model/evaluation.model';
import { EvaluationService } from './evaluation.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { UserService } from 'app/core/user/user.service';
import { IUser } from 'app/core/user/user.model';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { ProjetService } from 'app/entities/projet/projet.service';
import { IProjet } from 'app/shared/model/projet.model';
import { TranslateService } from '@ngx-translate/core';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';
import { EvaluationExportComponent } from 'app/entities/evaluation/evaluation_export.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'jhi-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.scss']
})
export class EvaluationComponent implements OnInit, OnDestroy {
  evaluations?: IEvaluation[];
  eventSubscriber?: Subscription;
  currentSearch: string;
  users: IUser[] = [];
  extras: IUserExtra[] = [];
  filteredExtra: IUserExtra[] = [];
  projects: IProjet[] = [];
  markCDC: string;
  coefCDC: string;
  markDefense: string;
  coefDefense: string;
  markRendering: string;
  coefRendering: string;
  finalMark: string;
  currentProjectId: number;
  currentProjectName: string;
  L3: TypeCursus = TypeCursus.L3;
  M1: TypeCursus = TypeCursus.M1;
  M2: TypeCursus = TypeCursus.M2;
  selectedGrade: TypeCursus;

  constructor(
    protected evaluationService: EvaluationService,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute,
    protected userExtraService: UserExtraService,
    protected userService: UserService,
    protected projetService: ProjetService,
    protected translate: TranslateService,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) {
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';
  }

  loadAll(): void {
    this.evaluationService.findByActif(true).subscribe(evaluations => {
      if (evaluations !== null && evaluations.body !== null) {
        this.evaluations = evaluations.body;
      }
    });
  }

  search(query: string): void {
    this.currentSearch = query;
    this.loadAll();
  }

  ngOnInit(): void {
    this.loadAll();
    this.registerChangeInEvaluations();
    this.userService.findByActivated(true).subscribe(users => {
      if (users !== null) {
        this.users = users;
      }
    });
    this.userExtraService.findByActif(true).subscribe(extras => {
      if (extras !== null) {
        this.extras = extras.body;
        this.filterStudents(this.L3);
      }
    });
    this.projetService.findAll().subscribe(projets => {
      if (projets !== null) {
        this.projects = projets;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  registerChangeInEvaluations(): void {
    this.eventSubscriber = this.eventManager.subscribe('evaluationListModification', () => this.loadAll());
  }

  /**
   * Return true if a student exist
   */
  isDisplayedEvaluation(): boolean {
    if (this.extras !== null) {
      for (const extra of this.extras) {
        if (extra.typeUtilisateur === TypeUtilisateur.ETUDIANT) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Return true if the user is an active student
   * @param extra
   */
  isActiveStudent(extra: IUserExtra): boolean {
    if (extra !== null) {
      return extra.actif && extra.typeUtilisateur === TypeUtilisateur.ETUDIANT;
    }
    return false;
  }

  /**
   * Return the name of the user
   * @param extra
   */
  getStudentName(extra: IUserExtra): string {
    if (extra !== null && this.users !== null && this.users !== undefined) {
      for (const user of this.users) {
        if (user.id === extra.id) {
          this.getEvaluation(extra.evaluationId);
          return this.formatName(user.firstName) + ' ' + user.lastName.toUpperCase();
        }
      }
    }
    return '';
  }

  /**
   * Search and set all parameters of the evaluation param
   * @param evaluation
   */
  getEvaluation(evaluation: number): void {
    this.markCDC = null;
    this.coefCDC = null;
    this.markDefense = null;
    this.coefDefense = null;
    this.markRendering = null;
    this.coefRendering = null;
    this.finalMark = null;
    if (this.evaluations !== null && this.evaluations !== undefined) {
      for (const eva of this.evaluations) {
        if (eva.id === evaluation) {
          this.markCDC = eva.noteCDC.toString();
          this.coefCDC = eva.coefCDC.toString();
          this.markDefense = eva.noteSoutenance.toString();
          this.coefDefense = eva.coefSoutenance.toString();
          this.markRendering = eva.noteRendu.toString();
          this.coefRendering = eva.coefRendu.toString();
          this.finalMark = eva.noteFinale.toString();
          return;
        }
      }
    }
  }

  /**
   * Return the CDC mark
   */
  getMarkCDC(): string {
    if (this.markCDC) {
      return this.markCDC;
    }
    return '-';
  }

  /**
   * Return the CDC coefficient
   */
  getCoefCDC(): string {
    if (this.coefCDC) {
      return this.coefCDC;
    }
    return '-';
  }

  /**
   * Return the defense mark
   */
  getMarkDefense(): string {
    if (this.markDefense) {
      return this.markDefense;
    }
    return '-';
  }

  /**
   * Return the defense coefficient
   */
  getCoefDefense(): string {
    if (this.coefDefense) {
      return this.coefDefense;
    }
    return '-';
  }

  /**
   * Return the rendering mark
   */
  getMarkRendering(): string {
    if (this.markRendering) {
      return this.markRendering;
    }
    return '-';
  }

  /**
   * Return the rendering coefficient
   */
  getCoefRendering(): string {
    if (this.coefRendering) {
      return this.coefRendering;
    }
    return '-';
  }

  /**
   * Return the final mark
   */
  getFinalMark(): string {
    if (this.finalMark) {
      return this.finalMark;
    }
    return '-';
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
   * Return the project name of the param group
   * @param group
   */
  getProject(group: number): boolean {
    this.currentProjectId = null;
    this.currentProjectName = null;
    if (group !== null) {
      if (this.projects !== null && this.projects !== undefined) {
        for (const project of this.projects) {
          if (project.groupeId === group) {
            if (project.nom === null || project.nom === '') {
              this.currentProjectName = '-';
              return true;
            }
            this.currentProjectId = project.id;
            this.currentProjectName = project.nom;
            return true;
          }
        }
      }
    }
    this.currentProjectName = '-';
    return true;
  }

  /**
   * Generate the csv file based on the evaluation table
   */
  export(): void {
    const table = document.getElementById('data') as HTMLTableElement;
    let data = '';
    let fileName = '';
    if (this.translate.currentLang === this.translate.getLangs()[0]) {
      data =
        'Étudiant;Projet;Note cahier des charges;Coefficient cahier des charges;' +
        'Note soutenance;Coefficient soutenance;Note rendu;Coefficient rendu;Note finale';
      fileName = this.selectedGrade + '_evaluation_projets.csv';
    } else {
      data =
        'Student;Project;Specification mark;Specification coefficient;Defense mark;' +
        'Defense coefficient;Rendering mark;Rendering coefficient;Final mark';
      fileName = this.selectedGrade + '_rating_projects.csv';
    }
    if (table !== null) {
      const rows = table.rows;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        data =
          data +
          '\r\n' +
          row.cells[0].textContent.trim() +
          ';' +
          row.cells[1].textContent.trim() +
          ';' +
          row.cells[2].textContent.trim() +
          ';' +
          row.cells[3].textContent.trim() +
          ';' +
          row.cells[4].textContent.trim() +
          ';' +
          row.cells[5].textContent.trim() +
          ';' +
          row.cells[6].textContent.trim() +
          ';' +
          row.cells[7].textContent.trim() +
          ';' +
          row.cells[8].textContent.trim();
      }
      const modalRef = this.modalService.open(EvaluationExportComponent, { size: 'lg', backdrop: 'static' });
      modalRef.componentInstance.passEntry.subscribe((value: boolean) => {
        if (value) {
          const blob = new Blob([data], { type: 'type/txt' });
          const url = window.URL.createObjectURL(blob);
          const doc = document.createElement('a');
          doc.href = url;
          doc.download = fileName;
          document.body.appendChild(doc);
          doc.click();
          document.body.removeChild(doc);
          window.URL.revokeObjectURL(url);
        } else {
          console.error('');
        }
      });
    }
  }

  /**
   * Filter students bu grade
   * @param grade
   */
  filterStudents(grade: TypeCursus): void {
    this.selectedGrade = grade;
    this.filteredExtra = [];
    for (const extra of this.extras) {
      if (extra.cursus === grade) {
        this.filteredExtra.push(extra);
      }
    }
    this.changeColorFilterButtons(grade);
  }

  /**
   * Change color buttons based on the pushed grade button
   * @param grade
   */
  changeColorFilterButtons(grade: TypeCursus): void {
    if (
      document.getElementById('filtreL3') !== null &&
      document.getElementById('filtreM1') !== null &&
      document.getElementById('filtreM2') !== null
    ) {
      document.getElementById('filtreL3').setAttribute('class', 'btn btn-danger btn-sm');
      document.getElementById('filtreM1').setAttribute('class', 'btn btn-danger btn-sm');
      document.getElementById('filtreM2').setAttribute('class', 'btn btn-danger btn-sm');
      if (grade === TypeCursus.L3) {
        document.getElementById('filtreL3').setAttribute('class', 'btn btn-success btn-sm');
      } else if (grade === TypeCursus.M1) {
        document.getElementById('filtreM1').setAttribute('class', 'btn btn-success btn-sm');
      } else {
        document.getElementById('filtreM2').setAttribute('class', 'btn btn-success btn-sm');
      }
    }
  }
}
