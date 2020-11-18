import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AlgoliaChipsAutocompleteComponent } from './algolia-chips-autocomplete.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { AlgoliaAutocompleteModule } from '../autocomplete/algolia-autocomplete.module';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes/deep-key.pipe'

// Material

@NgModule({
  declarations: [
    AlgoliaChipsAutocompleteComponent,
  ],
  exports: [
    AlgoliaChipsAutocompleteComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlgoliaAutocompleteModule,
    DeepKeyPipeModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
  ]
})
export class AlgoliaChipsAutocompleteModule { }
