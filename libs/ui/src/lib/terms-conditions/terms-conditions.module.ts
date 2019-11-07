import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { TermsAndConditionsComponent } from './terms-conditions.component';

// Material
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [TermsAndConditionsComponent],
  imports: [RouterModule, CommonModule, FlexLayoutModule, MatCheckboxModule],
  exports: [TermsAndConditionsComponent]
})
export class TermsAndConditionsModule {}
