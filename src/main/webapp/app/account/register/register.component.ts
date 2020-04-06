import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';

import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/shared/constants/error.constants';
import { RegisterService } from './register.service';
import { IUser, TypeUtilisateur, User } from 'app/core/user/user.model';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { JhiLanguageService } from 'ng-jhipster';
import { LoginService } from 'app/core/login/login.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';

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
  typeUtilisateur = [TypeUtilisateur.CLIENT, TypeUtilisateur.ETUDIANT];
  account!: Account;

  registerForm = this.fb.group({
    login: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern('^[_.@A-Za-z0-9-]*$')]],
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    typeUtilisateur: ['']
  });

  constructor(
    private registerService: RegisterService,
    private fb: FormBuilder,
    private router: Router,
    private languageService: JhiLanguageService,
    private loginService: LoginService,
    private accountService: AccountService
  ) {}

  ngAfterViewInit(): void {
    if (this.login) {
      this.login.nativeElement.focus();
    }
    this.registerForm.get(['typeUtilisateur'])?.setValue(TypeUtilisateur.ETUDIANT);
  }

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
      const createdDate = moment();
      const user: IUser = new User(
        undefined,
        login,
        firstName,
        lastName,
        email,
        true,
        this.languageService.currentLang,
        undefined,
        undefined,
        createdDate,
        undefined,
        undefined,
        password,
        true,
        typeUtilisateur
      );
      this.registerService.save(user).subscribe(
        () => {
          this.success = true;
        },
        response => this.processError(response)
      );
      this.loginService
        .login({
          username: user.login!.toString(),
          password: user.password!.toString(),
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
