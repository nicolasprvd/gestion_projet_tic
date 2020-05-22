import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { LoginService } from 'app/core/login/login.service';
import { Account } from 'app/core/user/account.model';

@Component({
  selector: 'jhi-login-modal',
  templateUrl: './login.component.html'
})
export class LoginModalComponent implements AfterViewInit {
  @ViewChild('username', { static: false })
  username?: ElementRef;
  account: Account;

  authenticationError = false;

  loginForm = this.fb.group({
    username: [''],
    password: [''],
    rememberMe: [false]
  });

  constructor(private loginService: LoginService, private router: Router, public activeModal: NgbActiveModal, private fb: FormBuilder) {}

  ngAfterViewInit(): void {
    if (this.username) {
      this.username.nativeElement.focus();
    }
  }

  /**
   * Close the login popin
   */
  cancel(): void {
    this.authenticationError = false;
    this.loginForm.patchValue({
      username: '',
      password: ''
    });
    this.activeModal.dismiss('cancel');
  }

  /**
   * Connect the user if the username match with the password
   */
  login(): void {
    this.loginService
      .login({
        username: this.loginForm.get('username')!.value,
        password: this.loginForm.get('password')!.value,
        rememberMe: this.loginForm.get('rememberMe')!.value
      })
      .subscribe(
        () => {
          this.activeModal.close();
          this.authenticationError = false;
          if (
            this.router.url === '/account/register' ||
            this.router.url.startsWith('/account/activate') ||
            this.router.url.startsWith('/account/reset/')
          ) {
            this.router.navigate(['/']);
          }
        },
        error => console.error(error)
      );
  }

  /**
   * Redirect to the register page
   */
  register(): void {
    this.activeModal.dismiss('to state register');
    this.router.navigate(['/account/register']);
  }

  /**
   * Redirect to the reset password page
   */
  requestResetPassword(): void {
    this.activeModal.dismiss('to state requestReset');
    this.router.navigate(['/account/reset', 'request']);
  }
}
