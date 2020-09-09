import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TotalRuntimeComponent } from './total-runtime.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [TotalRuntimeComponent],
  exports: [TotalRuntimeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class MovieFormTotalRuntimeModule { }
