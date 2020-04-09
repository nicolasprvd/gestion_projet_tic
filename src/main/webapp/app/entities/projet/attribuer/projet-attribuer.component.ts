import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjetService } from 'app/entities/projet/projet.service';
import { IProjet } from 'app/shared/model/projet.model';
import { ActivatedRoute } from '@angular/router';
import { Groupe } from 'app/shared/model/groupe.model';
import { GroupeService } from 'app/entities/groupe/groupe.service';

@Component({
  selector: 'jhi-projet-attribuer',
  templateUrl: './projet-attribuer.component.html',
  styleUrls: ['./projet-attribuer.scss']
})
export class ProjetAttribuerComponent implements OnInit, OnDestroy {
  projet?: IProjet;
  groupes: Groupe[] = [];

  constructor(protected projetService: ProjetService, protected activatedRoute: ActivatedRoute, protected groupeService: GroupeService) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => (this.projet = projet));
    this.groupeService.findAll().subscribe(groupes => {
      for (const g of groupes) {
        if (g.projetId === this.projet.id) {
          this.groupes.push(g);
        }
      }
    });
  }

  /**
   * Return to the previous page
   */
  previousState(): void {
    window.history.back();
  }

  ngOnDestroy(): void {}
}
