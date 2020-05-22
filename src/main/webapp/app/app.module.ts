import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import './vendor';
import { ProjetticSharedModule } from 'app/shared/shared.module';
import { ProjetticCoreModule } from 'app/core/core.module';
import { ProjetticAppRoutingModule } from './app-routing.module';
import { ProjetticHomeModule } from './home/home.module';
import { ProjetticFAQModule } from './faq/faq.module';
import { ProjetticEntityModule } from './entities/entity.module';
import { MainComponent } from './layouts/main/main.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { PageRibbonComponent } from './layouts/profiles/page-ribbon.component';
import { ActiveMenuDirective } from './layouts/navbar/active-menu.directive';
import { ErrorComponent } from './layouts/error/error.component';
import { HeaderComponent } from 'app/layouts/header/header.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ProjetticSharedModule,
    ProjetticCoreModule,
    ProjetticHomeModule,
    ProjetticFAQModule,
    ProjetticEntityModule,
    ProjetticAppRoutingModule,
    BrowserAnimationsModule,
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
