// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pages
import { PrivacyPageComponent } from './privacy-page.component';

// Material
import { TermsConditionsModule } from '@blockframes/auth/components/terms-conditions/terms-conditions.module';

@NgModule({
  declarations: [PrivacyPageComponent],
  imports: [
    TermsConditionsModule,
    RouterModule.forChild([
      {
        path: '',
        component: PrivacyPageComponent
      }
    ])
  ]
})
export class PrivacyModule {}
