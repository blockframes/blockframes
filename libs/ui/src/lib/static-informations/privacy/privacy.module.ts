// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pages
import { PrivacyComponent } from './privacy.component';
import { PrivacyPolicyModule } from '@blockframes/auth/components/privacy-policy/privacy-policy.module';

@NgModule({
  declarations: [PrivacyComponent],
  imports: [
    PrivacyPolicyModule,
    RouterModule.forChild([
      {
        path: '',
        component: PrivacyComponent
      }
    ])
  ]
})
export class PrivacyModule {}
