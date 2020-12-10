import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { FormChipsAutocompleteComponent } from './chips-autocomplete.component';

@NgModule({
  declarations: [FormChipsAutocompleteComponent],
  exports: [FormChipsAutocompleteComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule
  ]
})
export class FormChipsAutocompleteModule { }