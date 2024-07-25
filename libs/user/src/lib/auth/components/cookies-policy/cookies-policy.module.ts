// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { CookiesPolicyComponent } from './cookies-policy.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Blockframes
import { CookiesPolicyTextModule } from '../cookies-policy-text/cookies-policy-text.module';
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';

@NgModule({
  declarations: [CookiesPolicyComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    CookiesPolicyTextModule,
    GlobalModalModule
  ],
  exports: [CookiesPolicyComponent]
})
export class CookiesPolicyModule { }
