// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Component
import { TermsConditionsComponent } from './terms-conditions.component';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [TermsConditionsComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    FlexLayoutModule,
    AppPipeModule,
    MatIconModule,
    RouterModule
  ],
  exports: [TermsConditionsComponent]
})
export class TermsConditionsModule {}
