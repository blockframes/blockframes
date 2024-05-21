import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypedFieldComponent } from './typed-field.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectFormModule } from '../select';


@NgModule({
  declarations: [TypedFieldComponent],
  exports: [TypedFieldComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    SelectFormModule,
  ]
})
export class TypedFieldModule { }
