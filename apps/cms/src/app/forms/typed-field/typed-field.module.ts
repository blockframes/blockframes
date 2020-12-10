import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypedFieldComponent } from './typed-field.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
