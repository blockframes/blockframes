// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { PrivacyPolicyComponent } from './privacy-policy.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [PrivacyPolicyComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    FlexLayoutModule,
    MatIconModule,
  ],
  exports: [PrivacyPolicyComponent]
})
export class PrivacyPolicyModule { }
