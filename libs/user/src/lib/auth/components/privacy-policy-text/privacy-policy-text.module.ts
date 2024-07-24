// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Component
import { PrivacyPolicyTextComponent } from './privacy-policy-text.component';

// Material
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [PrivacyPolicyTextComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule
  ],
  exports: [PrivacyPolicyTextComponent]
})
export class PrivacyPolicyTextModule { }
