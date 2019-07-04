import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Components
import { StringFormFieldComponent } from './form-field/string-form-field/string-form-field.component';
import { TextareaFormFieldComponent } from './form-field/textarea-form-field/textarea-form-field.component';
import { ChipsAutocompleteComponent } from './chips-autocomplete/chips-autocomplete.component';
import { UrlFormFieldComponent } from './form-field/url-form-field/url-form-field.component';
import { EmailFormFieldComponent } from './form-field/email-form-field/email-form-field.component';
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
    StringFormFieldComponent,
    TextareaFormFieldComponent,
    ChipsAutocompleteComponent,
    EmailFormFieldComponent,
    PasswordFormFieldComponent,
    PasswordConfirmComponent,
    UrlFormFieldComponent
  ],
  exports: [
    StringFormFieldComponent,
    TextareaFormFieldComponent,
    ChipsAutocompleteComponent,
    EmailFormFieldComponent,
    PasswordFormFieldComponent,
    PasswordConfirmComponent,
    UrlFormFieldComponent
  ],
})
export class UiFormModule { }
