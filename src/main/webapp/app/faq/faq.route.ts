import { Route } from '@angular/router';

import { FAQComponent } from './faq.component';

export const FAQ_ROUTE: Route = {
  path: 'faq',
  component: FAQComponent,
  data: {
    authorities: [],
    pageTitle: 'faq.title'
  }
};
