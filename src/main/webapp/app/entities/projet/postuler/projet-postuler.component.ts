import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProjet } from 'app/shared/model/projet.model';
import { JhiDataUtils } from 'ng-jhipster';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { User } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';

@Component({
  selector: 'jhi-projet-postuler',
  templateUrl: './projet-postuler.component.html',
  styleUrls: ['./projet-postuler.scss']
})
export class ProjetPostulerComponent implements OnInit, OnDestroy {
  projet!: IProjet;
  account!: Account | null;
  users: User[] = [];
  nbEtuArray: (number | undefined)[] | undefined;

  constructor(
    protected dataUtils: JhiDataUtils,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => (this.projet = projet));
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });
    this.userService.findAll().subscribe(users => {
      for (const u of users) {
        if (u.id !== this.account?.id) {
          u.firstName = u.firstName?.toLowerCase();
          u.lastName = u.lastName?.toLowerCase();
          this.users.push(u);
        }
      }
      this.users.sort((n1: User, n2: User) => {
        if (n1.firstName! > n2.firstName!) {
          return 1;
        }
        if (n1.firstName! < n2.firstName!) {
          return -1;
        }
        return 0;
      });
    });
    this.nbEtuArray = Array(this.projet.nbEtudiant! - 1);
  }

  ngOnDestroy(): void {}

  postuler(): void {}

  previousState(): void {
    window.history.back();
  }
}
