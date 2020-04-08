import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LanguageFilterComponent } from './language-filter.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslateSlugModule } from '@blockframes/utils/pipes';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

// Material

@NgModule({
  declarations: [
    LanguageFilterComponent,
  ],
  exports: [
    LanguageFilterComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    TranslateSlugModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatButtonModule,
  ]
})
export class LanguageFilterModule { }
