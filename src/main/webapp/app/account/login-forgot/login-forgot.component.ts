import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { UserService } from 'app/core/user/user.service';
import { LoginForgotService } from 'app/account/login-forgot/login-forgot.service';
@Component({
  selector: 'jhi-login-forgot',
  templateUrl: './login-forgot.component.html'
})
export class LoginForgotComponent implements AfterViewInit {
  @ViewChild('email', { static: false })
  email?: ElementRef;

  success = false;
  subject: string;
  content: string;
  loginRequestForm = this.fb.group({
    email: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email]]
  });

  constructor(private userService: UserService, private fb: FormBuilder, private loginForgotService: LoginForgotService) {}

  ngAfterViewInit(): void {
    if (this.email) {
      this.email.nativeElement.focus();
    }
  }

  requestLogin(): void {
    this.loginForgotService.save(this.loginRequestForm.get(['email'])!.value).subscribe(() => (this.success = true));
  }
}
