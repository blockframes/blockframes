import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Components
import { ChipsAutocompleteComponent } from './chips-autocomplete/chips-autocomplete.component';
import { PasswordFormFieldComponent } from './form-field/password-form-field/password-form-field.component';
import { PasswordConfirmComponent } from './form-groups/password-confirm/password-confirm.component';

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
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  declarations: [
    ChipsAutocompleteComponent,
    PasswordFormFieldComponent,
    PasswordConfirmComponent
  ],
  exports: [
    ChipsAutocompleteComponent,
    PasswordFormFieldComponent,
    PasswordConfirmComponent
  ],
})
export class UiFormModule { }
