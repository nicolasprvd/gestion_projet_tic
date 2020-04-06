import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IProjet } from 'app/shared/model/projet.model';
import { ProjetService } from './projet.service';

@Component({
  templateUrl: './projet-delete-dialog.component.html'
})
export class ProjetDeleteDialogComponent {
  projet?: IProjet;

  constructor(protected projetService: ProjetService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.projetService.delete(id).subscribe(() => {
      this.eventManager.broadcast('projetListModification');
      this.activeModal.close();
    });
  }
}
