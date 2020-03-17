import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgoliaAutocompleteComponent } from './algolia-autocomplete.component';

// Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  declarations: [AlgoliaAutocompleteComponent],
  exports: [AlgoliaAutocompleteComponent]
})
export class AlgoliaAutocompleteModule { }
