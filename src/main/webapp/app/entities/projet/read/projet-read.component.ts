import { Component, OnInit, OnDestroy } from '@angular/core';
import { IProjet } from 'app/shared/model/projet.model';
import { ProjetService } from 'app/entities/projet/projet.service';

@Component({
  templateUrl: 'projet-read.component.html',
  styleUrls: ['projet-read.scss']
})
export class ProjetReadComponent implements OnInit, OnDestroy {
  projets: IProjet[];

  constructor(private projetService: ProjetService) {
    this.projets = [];
  }

  ngOnInit(): void {
    this.projetService.findAll().subscribe(res => {
      this.projets = res;
      console.error(this.projets);
    });
  }

  ngOnDestroy(): void {}
}
