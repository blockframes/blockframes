// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { TermsConditionsComponent } from './terms-conditions.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [TermsConditionsComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
  ],
  exports: [TermsConditionsComponent]
})
export class TermsConditionsModule {}
