import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgoliaAutocompleteComponent, LastOptionRefDirective, OptionRefDirective } from './algolia-autocomplete.component';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { DeepKeyPipeModule } from '@blockframes/utils/pipes/deep-key.pipe';

// Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    DeepKeyPipeModule,

    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatDividerModule,
  ],
  declarations: [AlgoliaAutocompleteComponent, OptionRefDirective, LastOptionRefDirective],
  exports: [AlgoliaAutocompleteComponent, OptionRefDirective, LastOptionRefDirective]
})
export class AlgoliaAutocompleteModule { }
