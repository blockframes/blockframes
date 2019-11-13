import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { AcceptTermsAndConditionsComponent } from './terms-conditions.component';
import { ConditionsDirective } from './conditions.directive';

// Material
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [AcceptTermsAndConditionsComponent, ConditionsDirective],
  imports: [RouterModule, CommonModule, FlexLayoutModule, MatCheckboxModule],
  exports: [AcceptTermsAndConditionsComponent, ConditionsDirective]
})
export class TermsAndConditionsModule {}
