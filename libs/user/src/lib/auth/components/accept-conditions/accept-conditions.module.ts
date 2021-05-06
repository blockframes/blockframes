import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { AcceptConditionsComponent } from './accept-conditions.component';
import { AcceptConditionsDirective } from './accept-conditions.directive';

// Material
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

const material = [ MatCheckboxModule, MatDialogModule, MatButtonModule ];

@NgModule({
  declarations: [AcceptConditionsComponent, AcceptConditionsDirective],
  imports: [RouterModule, CommonModule, FlexLayoutModule, ...material],
  exports: [AcceptConditionsComponent, AcceptConditionsDirective]
})
export class AcceptConditionsModule {}
