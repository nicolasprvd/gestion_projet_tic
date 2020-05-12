import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IEvaluation } from 'app/shared/model/evaluation.model';
import { EvaluationService } from './evaluation.service';
import { EvaluationDeleteDialogComponent } from './evaluation-delete-dialog.component';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { UserService } from 'app/core/user/user.service';
import { IUser } from 'app/core/user/user.model';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { ProjetService } from 'app/entities/projet/projet.service';
import { IProjet } from 'app/shared/model/projet.model';
import { TranslateService } from '@ngx-translate/core';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';

@Component({
  selector: 'jhi-evaluation',
  templateUrl: './evaluation.component.html'
})
export class EvaluationComponent implements OnInit, OnDestroy {
  evaluations?: IEvaluation[];
  eventSubscriber?: Subscription;
  currentSearch: string;
  users: IUser[] = [];
  extras: IUserExtra[] = [];
  extrasFiltres: IUserExtra[] = [];
  projets: IProjet[] = [];
  noteCDC: string;
  noteSoutenance: string;
  noteRendu: string;
  noteFinale: string;
  projetActuelId: number;
  projetActuelNom: string;
  L3: TypeCursus = TypeCursus.L3;
  M1: TypeCursus = TypeCursus.M1;
  M2: TypeCursus = TypeCursus.M2;
  cursusSelectionne: TypeCursus;

  constructor(
    protected evaluationService: EvaluationService,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute,
    protected userExtraService: UserExtraService,
    protected userService: UserService,
    protected projetService: ProjetService,
    protected translate: TranslateService
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
        this.filtrerEtudiant(this.L3);
      }
    });
    this.projetService.findAll().subscribe(projets => {
      if (projets !== null) {
        this.projets = projets;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: IEvaluation): number {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return item.id!;
  }

  registerChangeInEvaluations(): void {
    this.eventSubscriber = this.eventManager.subscribe('evaluationListModification', () => this.loadAll());
  }

  delete(evaluation: IEvaluation): void {
    const modalRef = this.modalService.open(EvaluationDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.evaluation = evaluation;
  }

  isEvaluationAffiche(): boolean {
    if (this.extras !== null) {
      for (const extra of this.extras) {
        if (extra.typeUtilisateur === TypeUtilisateur.ETUDIANT) {
          return true;
        }
      }
    }
    return false;
  }

  isEtudiantActif(extra: IUserExtra): boolean {
    if (extra !== null) {
      return extra.actif && extra.typeUtilisateur === TypeUtilisateur.ETUDIANT;
    }
    return false;
  }

  getEtudiant(extra: IUserExtra): string {
    if (extra !== null && this.users !== null && this.users !== undefined) {
      for (const user of this.users) {
        if (user.id === extra.id) {
          this.getEvaluation(extra.evaluationId);
          return this.formatNom(user.firstName) + ' ' + user.lastName.toUpperCase();
        }
      }
    }
    return '';
  }

  getEvaluation(evaluation: number): void {
    this.noteCDC = null;
    this.noteSoutenance = null;
    this.noteRendu = null;
    this.noteFinale = null;
    if (this.evaluations !== null && this.evaluations !== undefined) {
      for (const eva of this.evaluations) {
        if (eva.id === evaluation) {
          this.noteCDC = eva.noteCDC.toString();
          this.noteSoutenance = eva.noteSoutenance.toString();
          this.noteRendu = eva.noteRendu.toString();
          this.noteFinale = eva.noteFinale.toString();
          return;
        }
      }
    }
  }

  getNoteCDC(): string {
    if (this.noteCDC) {
      return this.noteCDC;
    }
    return '-';
  }

  getNoteSoutenance(): string {
    if (this.noteSoutenance) {
      return this.noteSoutenance;
    }
    return '-';
  }

  getNoteRendu(): string {
    if (this.noteRendu) {
      return this.noteRendu;
    }
    return '-';
  }

  getNoteFinale(): string {
    if (this.noteFinale) {
      return this.noteFinale;
    }
    return '-';
  }

  formatNom(str: string): string {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getProjet(groupe: number): boolean {
    this.projetActuelId = null;
    this.projetActuelNom = null;
    if (groupe !== null) {
      if (this.projets !== null && this.projets !== undefined) {
        for (const projet of this.projets) {
          if (projet.groupeId === groupe) {
            if (projet.nom === null || projet.nom === '') {
              this.projetActuelNom = '-';
              return true;
            }
            this.projetActuelId = projet.id;
            this.projetActuelNom = projet.nom;
            return true;
          }
        }
      }
    }
    this.projetActuelNom = '-';
    return true;
  }

  exporter(): void {
    const table = document.getElementById('data') as HTMLTableElement;
    let donnees = '';
    let nomFichier = '';
    if (this.translate.currentLang === this.translate.getLangs()[0]) {
      donnees = 'Étudiant;Projet;Note CDC;Note Soutenance;Note Rendu;Note Finale';
      nomFichier = this.cursusSelectionne + '_evaluation_projet_tic.csv';
    } else {
      donnees = 'Student;Project;Specification mark;Defense mark;Rendering mark;Final mark';
      nomFichier = this.cursusSelectionne + '_rating_tic_project.csv';
    }
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      donnees =
        donnees +
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
        row.cells[5].textContent.trim();
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

  filtrerEtudiant(niveau: TypeCursus): void {
    this.cursusSelectionne = niveau;
    this.extrasFiltres = [];
    for (const extra of this.extras) {
      if (extra.cursus === niveau) {
        this.extrasFiltres.push(extra);
      }
    }
    this.modifierCouleurBoutonFiltre(niveau);
  }

  modifierCouleurBoutonFiltre(niveau: TypeCursus): void {
    if (
      document.getElementById('filtreL3') !== null &&
      document.getElementById('filtreM1') !== null &&
      document.getElementById('filtreM2') !== null
    ) {
      document.getElementById('filtreL3').setAttribute('class', 'btn btn-danger btn-sm');
      document.getElementById('filtreM1').setAttribute('class', 'btn btn-danger btn-sm');
      document.getElementById('filtreM2').setAttribute('class', 'btn btn-danger btn-sm');
      if (niveau === TypeCursus.L3) {
        document.getElementById('filtreL3').setAttribute('class', 'btn btn-success btn-sm');
      } else if (niveau === TypeCursus.M1) {
        document.getElementById('filtreM1').setAttribute('class', 'btn btn-success btn-sm');
      } else {
        document.getElementById('filtreM2').setAttribute('class', 'btn btn-success btn-sm');
      }
    }
  }
}
