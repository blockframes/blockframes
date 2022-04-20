import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormContentTypeComponent } from './content-type.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [FormContentTypeComponent],
  exports: [FormContentTypeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Material
    MatButtonToggleModule
  ]
})
export class FormContentTypeModule { }
