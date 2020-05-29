import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JhiLanguageService } from 'ng-jhipster';
import { SessionStorageService } from 'ngx-webstorage';
import { VERSION } from 'app/app.constants';
import { LANGUAGES } from 'app/core/language/language.constants';
import { AccountService } from 'app/core/auth/account.service';
import { LoginModalService } from 'app/core/login/login-modal.service';
import { LoginService } from 'app/core/login/login.service';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { Account } from 'app/core/user/account.model';
import { Subscription } from 'rxjs';
import { IUser } from 'app/core/user/user.model';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { GroupeService } from 'app/entities/groupe/groupe.service';

@Component({
  selector: 'jhi-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['navbar.scss']
})
export class NavbarComponent implements OnInit {
  inProduction?: boolean;
  isNavbarCollapsed = true;
  languages = LANGUAGES;
  swaggerEnabled?: boolean;
  version: string;
  account: Account;
  authSubscription: Subscription;
  user: IUser;
  displayProject: boolean;
  student: boolean;
  userType: TypeUtilisateur;

  constructor(
    private loginService: LoginService,
    private languageService: JhiLanguageService,
    private sessionStorage: SessionStorageService,
    private accountService: AccountService,
    private loginModalService: LoginModalService,
    private profileService: ProfileService,
    private router: Router,
    private userExtraService: UserExtraService,
    private groupeService: GroupeService
  ) {
    this.version = VERSION ? (VERSION.toLowerCase().startsWith('v') ? VERSION : 'v' + VERSION) : '';
  }

  ngOnInit(): void {
    this.displayProject = false;
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction = profileInfo.inProduction;
      this.swaggerEnabled = profileInfo.swaggerEnabled;
    });
    this.authSubscription = this.accountService.getAuthenticationState().subscribe(account => {
      if (account !== null) {
        this.account = account;
        this.student = false;
        this.userType = null;
        if (this.isAuthenticated()) {
          this.userExtraService.find(account.id).subscribe(ue => {
            if (ue.body.typeUtilisateur === TypeUtilisateur.ETUDIANT) {
              this.student = true;
              if (ue.body.groupeId !== null) {
                this.groupeService.find(ue.body.groupeId).subscribe(grp => {
                  if (grp !== null && grp.body !== null) {
                    if (grp.body.valide === true) {
                      this.displayProject = true;
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  }

  changeLanguage(languageKey: string): void {
    this.sessionStorage.store('locale', languageKey);
    this.languageService.changeLanguage(languageKey);
  }

  collapseNavbar(): void {
    this.isNavbarCollapsed = true;
  }

  isAuthenticated(): boolean {
    return this.accountService.isAuthenticated();
  }

  login(): void {
    this.loginModalService.open();
  }

  logout(): void {
    this.collapseNavbar();
    this.displayProject = false;
    this.loginService.logout();
    this.router.navigate(['']);
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
}
