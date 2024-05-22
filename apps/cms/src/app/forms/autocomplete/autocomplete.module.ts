import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';

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