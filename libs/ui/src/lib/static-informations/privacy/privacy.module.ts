// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Pages
import { PrivacyComponent } from './privacy.component';
import { PrivacyPolicyTextModule } from '@blockframes/auth/components/privacy-policy-text/privacy-policy-text.module';

@NgModule({
  declarations: [PrivacyComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    PrivacyPolicyTextModule,
    RouterModule.forChild([
      {
        path: '',
        component: PrivacyComponent
      }
    ])
  ]
})
export class PrivacyModule {}
