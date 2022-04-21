// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { PrivacyPolicyTextComponent } from './privacy-policy-text.component';

// Material
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [PrivacyPolicyTextComponent],
  imports: [
    CommonModule,
    FlexLayoutModule
  ],
  exports: [PrivacyPolicyTextComponent]
})
export class PrivacyPolicyTextModule { }
