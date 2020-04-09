import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JhiDataUtils } from 'ng-jhipster';

import { IProjet } from 'app/shared/model/projet.model';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { AccountService } from 'app/core/auth/account.service';
import { UserService } from 'app/core/user/user.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { Account } from 'app/core/user/account.model';
import { IUser } from 'app/core/user/user.model';
// import { IDocument } from 'app/shared/model/document.model';

@Component({
  selector: 'jhi-projet-detail',
  templateUrl: './project-rate.component.html',
  styleUrls: ['./projet.scss']
})
export class ProjectRateComponent implements OnInit {
  project!: IProjet;
  account!: Account | null;
  authorities: string[] | undefined;
  groupId: number;
  user!: IUser;
  client!: IUser;
  typeUtilisateur?: TypeUtilisateur;
  login!: string | undefined;
  finalRate: number;

  constructor(
    protected dataUtils: JhiDataUtils,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => (this.project = projet));
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
      this.authorities = account?.authorities;
    });
    this.userExtraService.find(this.account.id).subscribe(userExtra => {
      this.typeUtilisateur = userExtra.body.typeUtilisateur;
      this.groupId = userExtra.body.groupeId;
    });

    this.userExtraService.find(this.project?.userExtraId).subscribe(userExtra => {
      this.userService.findById(userExtra.body.userId).subscribe(client => {
        this.client = client;
      });
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  previousState(): void {
    window.history.back();
  }

  openFile(contentType: string, base64String: string): void {
    this.dataUtils.openFile(contentType, base64String);
  }

  isClient(): boolean {
    return this.typeUtilisateur === TypeUtilisateur.CLIENT;
  }

  tmp() {
    console.log(this.project.documents);
  }
}
