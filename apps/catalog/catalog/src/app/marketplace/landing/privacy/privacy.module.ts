// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pages
import { PrivacyComponent } from './privacy.component';
import { TermsConditionsModule } from '@blockframes/auth/components/terms-conditions/terms-conditions.module';

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
