import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProjetticSharedModule } from 'app/shared/shared.module';
import { FAQ_ROUTE } from './faq.route';
import { FAQComponent } from './faq.component';

@NgModule({
  imports: [ProjetticSharedModule, RouterModule.forChild([FAQ_ROUTE])],
  declarations: [FAQComponent]
})
export class ProjetticFAQModule {}
