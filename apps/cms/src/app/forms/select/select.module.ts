import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
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
