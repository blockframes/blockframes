import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

import { FormAutocompleteComponent } from './autocomplete.component';

@NgModule({
  declarations: [FormAutocompleteComponent],
  exports: [FormAutocompleteComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatChipsModule,
  ]
})
export class FormAutocompleteModule { }