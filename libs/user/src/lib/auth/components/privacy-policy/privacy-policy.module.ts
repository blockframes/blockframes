// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { PrivacyPolicyComponent } from './privacy-policy.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';

@NgModule({
  declarations: [PrivacyPolicyComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    AppPipeModule
  ],
  exports: [PrivacyPolicyComponent]
})
export class PrivacyPolicyModule {}
