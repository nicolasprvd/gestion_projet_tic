import { Route } from '@angular/router';

import { LoginForgotComponent } from './login-forgot.component';

export const loginForgotRoute: Route = {
  path: 'login/request',
  component: LoginForgotComponent,
  data: {
    authorities: [],
    pageTitle: 'global.menu.account.password'
  }
};
