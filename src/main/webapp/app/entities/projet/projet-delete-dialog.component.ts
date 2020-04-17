import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IProjet } from 'app/shared/model/projet.model';
import { ProjetService } from './projet.service';
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";

@Component({
  templateUrl: './projet-delete-dialog.component.html'
})
export class ProjetDeleteDialogComponent {
  projet?: IProjet;

  constructor(
    protected projetService: ProjetService,
    public activeModal: NgbActiveModal,
    protected eventManager: JhiEventManager,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) {
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.projetService.delete(id).subscribe(() => {
        this.eventManager.broadcast('projetListModification');
        this.activeModal.close();
        this.toastrService.success(this.translateService.instant('global.toastr.suppressions.projet.message'), this.translateService.instant('global.toastr.suppressions.projet.title', {nom: this.projet.nom}));
      },
      () => {
        this.toastrService.error(this.translateService.instant('global.toastr.erreur.message'), this.translateService.instant('global.toastr.erreur.title'));
      }
    );
  }
}
