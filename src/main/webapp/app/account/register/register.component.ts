import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { JhiLanguageService } from 'ng-jhipster';
import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/shared/constants/error.constants';
import { LoginModalService } from 'app/core/login/login-modal.service';
import { RegisterService } from './register.service';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { LoginService } from 'app/core/login/login.service';
import { Router } from '@angular/router';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { UserService } from 'app/core/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ProjetService } from 'app/entities/projet/projet.service';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';

@Component({
  selector: 'jhi-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('login', { static: false })
  login?: ElementRef;

  doNotMatch = false;
  error = false;
  errorEmailExists = false;
  errorUserExists = false;
  success = false;
  typeUtilisateurs: string[];
  typeUtilisateurDefault: TypeUtilisateur;
  active = true;
  cursus: string[];
  cursusDefault: TypeCursus;

  registerForm = this.fb.group({
    login: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern('^[_.@A-Za-z0-9-]*$')]],
    email: [
      '',
      [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(254),
        Validators.email,
        Validators.pattern('^[A-Za-z0-9](\\.?[A-Za-z0-9]){2,}@etu\\.u-bordeaux\\.fr$')
      ]
    ],
    firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(254)]],
    lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(254)]],
    typeUtilisateur: [''],
    cursus: [''],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]]
  });

  constructor(
    private languageService: JhiLanguageService,
    protected projetService: ProjetService,
    private loginModalService: LoginModalService,
    private registerService: RegisterService,
    private fb: FormBuilder,
    private loginService: LoginService,
    protected userService: UserService,
    protected userExtraService: UserExtraService,
    private toastrService: ToastrService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.typeUtilisateurs = [TypeUtilisateur.ETUDIANT, TypeUtilisateur.CLIENT];
    this.typeUtilisateurDefault = TypeUtilisateur.ETUDIANT;
    this.cursus = [TypeCursus.L3, TypeCursus.M1, TypeCursus.M2];
    this.cursusDefault = TypeCursus.L3;
  }

  ngAfterViewInit(): void {
    if (this.login) {
      this.login.nativeElement.focus();
    }
  }

  /**
   * Register and log the user
   */
  register(): void {
    this.doNotMatch = false;
    this.error = false;
    this.errorEmailExists = false;
    this.errorUserExists = false;

    const password = this.registerForm.get(['password'])!.value;
    if (password !== this.registerForm.get(['confirmPassword'])!.value) {
      this.doNotMatch = true;
    } else {
      const login = this.registerForm.get(['login'])!.value;
      const email = this.registerForm
        .get(['email'])!
        .value.toString()
        .toLowerCase();
      const firstName = this.registerForm.get(['firstName'])!.value;
      const lastName = this.registerForm.get(['lastName'])!.value;
      const typeUtilisateur = this.registerForm.get(['typeUtilisateur'])!.value;
      if (typeUtilisateur === 'CLIENT') {
        this.active = false;
      }
      const activated = this.active;
      let cursus = this.registerForm.get(['cursus'])!.value;
      if (typeUtilisateur === TypeUtilisateur.CLIENT) {
        cursus = null;
      }
      this.registerService
        .save({
          login,
          firstName,
          lastName,
          email,
          password,
          activated,
          langKey: this.languageService.getCurrentLanguage(),
          typeUtilisateur,
          cursus
        })

        .subscribe(
          () => {
            this.success = true;

            if (typeUtilisateur === 'CLIENT') {
              this.router.navigate(['/']);
              this.toastrService.success(this.translateService.instant('global.toastr.register.message'));
            } else {
              this.loginService
                .login({
                  username: login.toString(),
                  password: password.toString(),
                  rememberMe: false
                })
                .subscribe(
                  () => {
                    if (
                      this.router.url === '/account/register' ||
                      this.router.url.startsWith('/account/activate') ||
                      this.router.url.startsWith('/account/reset/')
                    ) {
                      this.router.navigate(['/']);
                    }
                  },
                  () => (this.success = false)
                );
            }
          },
          response => this.processError(response)
        );
    }
  }

  private processError(response: HttpErrorResponse): void {
    if (response.status === 400 && response.error.type === LOGIN_ALREADY_USED_TYPE) {
      this.errorUserExists = true;
    } else if (response.status === 400 && response.error.type === EMAIL_ALREADY_USED_TYPE) {
      this.errorEmailExists = true;
    } else {
      this.error = true;
    }
  }

  afficherCursus(): void {
    const typeUtilisateur = this.registerForm.get(['typeUtilisateur'])!.value;
    if (typeUtilisateur === TypeUtilisateur.CLIENT) {
      document.getElementById('divCursus').style.display = 'none';
      this.registerForm.controls['email'].setValidators([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(254),
        Validators.email,
        Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
      ]);
    } else {
      document.getElementById('divCursus').style.display = 'block';
      this.registerForm.controls['email'].setValidators([
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(254),
        Validators.email,
        Validators.pattern('^[A-Za-z0-9](\\.?[A-Za-z0-9]){2,}@etu\\.u-bordeaux\\.fr$')
      ]);
    }
    this.registerForm.controls['email'].updateValueAndValidity();
  }

  isClient(): boolean {
    return this.registerForm.get(['typeUtilisateur'])!.value === TypeUtilisateur.CLIENT;
  }
}
