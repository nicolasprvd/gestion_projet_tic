import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IGroupe } from 'app/shared/model/groupe.model';
import { GroupeService } from './groupe.service';

@Component({
  templateUrl: './groupe-delete-dialog.component.html'
})
export class GroupeDeleteDialogComponent {
  groupe?: IGroupe;

  constructor(protected groupeService: GroupeService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.groupeService.delete(id).subscribe(() => {
      this.eventManager.broadcast('groupeListModification');
      this.activeModal.close();
    });
  }
}
