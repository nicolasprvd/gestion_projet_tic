import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { Authority } from 'app/shared/constants/authority.constants';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { Router } from '@angular/router';
import { IUserExtra } from 'app/shared/model/user-extra.model';

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  isSaving = false;
  isDesactive: boolean;
  account: Account | null = null;
  authSubscription?: Subscription;
  userExtras: IUserExtra[] = [];

  constructor(private accountService: AccountService, private userExtraService: UserExtraService, private router: Router) {}

  ngOnInit(): void {
    this.authSubscription = this.accountService.getAuthenticationState().subscribe(account => (this.account = account));
    if(this.accountService.isAuthenticated()) {
      this.userExtraService.findByActif(true).subscribe(userExtras => {
        this.userExtras = userExtras.body;
      });
      this.isDesactive = false;
    }

  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  isAdmin(): boolean {
    if (this.account === null || this.account.authorities === null) {
      return false;
    }
    for (const droit of this.account.authorities) {
      if (Authority.ADMIN === droit) {
        return true;
      }
    }
    return false;
  }

  nouvelleAnnee(): void {
    this.isSaving = true;
    for (const extra of this.userExtras) {
      if (extra.typeUtilisateur === TypeUtilisateur.ETUDIANT) {
        extra.actif = false;
        this.userExtraService.update(extra).subscribe(() => {
          this.isDesactive = true;
          this.onSaveSuccess();
        });
        this.isDesactive = false;
      }
    }
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.router.navigate(['/']);
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  isEtudiantActif(): boolean {
    for (const extra of this.userExtras) {
      if (extra.typeUtilisateur === TypeUtilisateur.ETUDIANT) {
        return true;
      }
    }
    return false;
  }
}
