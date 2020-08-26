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
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [PrivacyPolicyComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    MatIconModule,
    AppPipeModule
  ],
  exports: [PrivacyPolicyComponent]
})
export class PrivacyPolicyModule {}
