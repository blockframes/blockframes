import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateSlugModule, ToLabelModule } from '@blockframes/utils/pipes';

// Components
import { ChipsAutocompleteComponent } from './chips-autocomplete.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateSlugModule,
    ToLabelModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  declarations: [
    ChipsAutocompleteComponent,
  ],
  exports: [
    ChipsAutocompleteComponent,
  ],
})
export class ChipsAutocompleteModule { }
