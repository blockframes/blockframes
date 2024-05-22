import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputAutocompleteComponent } from './input-autocomplete.component';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToLabelModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule
  ],
  declarations: [InputAutocompleteComponent],
  exports: [InputAutocompleteComponent]
})
export class InputAutocompleteModule { }
