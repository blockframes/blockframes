import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { ReactiveFormsModule } from '@angular/forms';

import { SelectComponent, SelectOptionDirective } from './select.component';

@NgModule({
  declarations: [SelectComponent, SelectOptionDirective],
  exports: [SelectComponent, SelectOptionDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule
  ]
})
export class SelectFormModule { }
