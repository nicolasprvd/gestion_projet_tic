import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { JhiEventManager, JhiDataUtils } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IProjet } from 'app/shared/model/projet.model';
import { ProjetService } from './projet.service';
import { ProjetDeleteDialogComponent } from './projet-delete-dialog.component';

@Component({
  selector: 'jhi-projet',
  templateUrl: './projet.component.html'
})
export class ProjetComponent implements OnInit, OnDestroy {
  projets?: IProjet[];
  eventSubscriber?: Subscription;
  currentSearch: string;

  constructor(
    protected projetService: ProjetService,
    protected dataUtils: JhiDataUtils,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute
  ) {
    this.currentSearch =
      this.activatedRoute.snapshot && this.activatedRoute.snapshot.queryParams['search']
        ? this.activatedRoute.snapshot.queryParams['search']
        : '';
  }

  loadAll(): void {
    if (this.currentSearch) {
      this.projetService
        .search({
          query: this.currentSearch
        })
        .subscribe((res: HttpResponse<IProjet[]>) => (this.projets = res.body || []));
      return;
    }

    this.projetService.query().subscribe((res: HttpResponse<IProjet[]>) => (this.projets = res.body || []));
  }

  search(query: string): void {
    this.currentSearch = query;
    this.loadAll();
  }

  ngOnInit(): void {
    this.loadAll();
    this.registerChangeInProjets();
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

  delete(projet: IProjet): void {
    const modalRef = this.modalService.open(ProjetDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.projet = projet;
  }
}
