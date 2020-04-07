import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
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

@Component({
  selector: 'jhi-projet',
  templateUrl: './projet.component.html',
  styleUrls: ['./projet.scss']
})
export class ProjetComponent implements OnInit, OnDestroy {
  account!: Account | null;
  typeUtilisateur?: TypeUtilisateur;
  projets?: IProjet[];
  authorities!: string[] | undefined;
  eventSubscriber?: Subscription;
  currentSearch: string;
  accountExtraId!: number;

  constructor(
    protected projetService: ProjetService,
    protected dataUtils: JhiDataUtils,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService
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
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
      this.authorities = account?.authorities;
    });
    this.userExtraService.find(this.account!.id).subscribe(userExtra => {
      this.typeUtilisateur = userExtra.body?.typeUtilisateur;
      this.accountExtraId = userExtra.body?.id!;
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

  delete(projet: IProjet): void {
    const modalRef = this.modalService.open(ProjetDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.projet = projet;
  }

  /**
   * Return true if the current user is a CLIENT
   */
  isClient(): boolean {
    return this.typeUtilisateur === TypeUtilisateur.CLIENT;
  }

  /**
   * Return true if :
   * - the current user is an administrator
   * - the project was created by the current user
   */
  isAutorise(projet: IProjet): boolean {
    for (const droit of this.authorities!) {
      if (Authority.ADMIN === droit) {
        return true;
      }
    }
    if (this.isClient()) {
      return projet.userExtraId === this.accountExtraId;
    }
    return false;
  }

  /**
   * Return true if the current user is an administrator
   */
  isAdmin(): boolean {
    for (const droit of this.authorities!) {
      if (Authority.ADMIN === droit) {
        return true;
      }
    }
    return false;
  }
}
