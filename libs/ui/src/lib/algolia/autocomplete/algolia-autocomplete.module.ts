import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgoliaAutocompleteComponent } from './algolia-autocomplete.component';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  declarations: [AlgoliaAutocompleteComponent],
  exports: [AlgoliaAutocompleteComponent]
})
export class AlgoliaAutocompleteModule { }
