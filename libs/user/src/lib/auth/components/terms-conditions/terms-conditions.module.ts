// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Component
import { TermsConditionsComponent } from './terms-conditions.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { AppPipeModule } from '@blockframes/utils/pipes/app.pipe';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [TermsConditionsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: TermsConditionsComponent}]),
    MatCardModule,
    FlexLayoutModule,
    AppPipeModule,
    MatIconModule,
    RouterModule
  ],
  exports: [TermsConditionsComponent]
})
export class TermsConditionsModule {}
