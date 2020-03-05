// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pages
import { PrivacyComponent } from './privacy.component';

// Material
import { TermsConditionsModule } from '@blockframes/auth';

@NgModule({
  declarations: [PrivacyComponent],
  imports: [
    TermsConditionsModule,
    RouterModule.forChild([
      {
        path: '',
        component: PrivacyComponent
      }
    ])
  ]
})
export class PrivacyModule {}
