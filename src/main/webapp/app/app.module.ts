import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import './vendor';
import { ProjetticSharedModule } from 'app/shared/shared.module';
import { ProjetticCoreModule } from 'app/core/core.module';
import { ProjetticAppRoutingModule } from './app-routing.module';
import { ProjetticHomeModule } from './home/home.module';
import { ProjetticEntityModule } from './entities/entity.module';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import { MainComponent } from './layouts/main/main.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { PageRibbonComponent } from './layouts/profiles/page-ribbon.component';
import { ActiveMenuDirective } from './layouts/navbar/active-menu.directive';
import { ErrorComponent } from './layouts/error/error.component';
import { HeaderComponent } from 'app/layouts/header/header.component';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    BrowserModule,
    ProjetticSharedModule,
    ProjetticCoreModule,
    ProjetticHomeModule,
    // jhipster-needle-angular-add-module JHipster will add new module here
    ProjetticEntityModule,
    ProjetticAppRoutingModule,
    ToastrModule.forRoot({
      tapToDismiss: true,
      closeButton: true,
      disableTimeOut: false,
      easeTime: 300,
      timeOut: 8000,
      positionClass: 'toast-top-left',
      preventDuplicates: true
    })
  ],
  declarations: [
    MainComponent,
    NavbarComponent,
    ErrorComponent,
    PageRibbonComponent,
    ActiveMenuDirective,
    FooterComponent,
    HeaderComponent
  ],
  bootstrap: [MainComponent]
})
export class ProjetticAppModule {}
