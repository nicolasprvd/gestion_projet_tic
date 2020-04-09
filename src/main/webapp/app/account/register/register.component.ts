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

  registerForm = this.fb.group({
    login: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern('^[_.@A-Za-z0-9-]*$')]],
    email: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email]],
    firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(254)]],
    lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(254)]],
    typeUtilisateur: [''],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]]
  });

  constructor(
    private languageService: JhiLanguageService,
    private loginModalService: LoginModalService,
    private registerService: RegisterService,
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.typeUtilisateurs = [TypeUtilisateur.ETUDIANT, TypeUtilisateur.CLIENT];
    this.typeUtilisateurDefault = TypeUtilisateur.ETUDIANT;
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
      const email = this.registerForm.get(['email'])!.value;
      const firstName = this.registerForm.get(['firstName'])!.value;
      const lastName = this.registerForm.get(['lastName'])!.value;
      const typeUtilisateur = this.registerForm.get(['typeUtilisateur'])!.value;
      this.registerService
        .save({ login, firstName, lastName, email, password, langKey: this.languageService.getCurrentLanguage(), typeUtilisateur })
        .subscribe(
          () => {
            this.success = true;
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
                    this.router.navigate(['']);
                  }
                },
                () => (this.success = false)
              );
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
}
