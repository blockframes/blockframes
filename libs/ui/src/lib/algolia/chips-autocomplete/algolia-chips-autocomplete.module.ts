import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AlgoliaChipsAutocompleteComponent } from './algolia-chips-autocomplete.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
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
