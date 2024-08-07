// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { PrivacyPolicyComponent } from './privacy-policy.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Blockframes
import { PrivacyPolicyTextModule } from '../privacy-policy-text/privacy-policy-text.module';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

@NgModule({
  declarations: [PrivacyPolicyComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PrivacyPolicyTextModule,
    GlobalModalModule
  ],
  exports: [PrivacyPolicyComponent]
})
export class PrivacyPolicyModule { }
