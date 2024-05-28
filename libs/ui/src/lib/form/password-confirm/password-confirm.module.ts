import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Components
import { PasswordConfirmComponent } from './password-confirm.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

// Blockframes
import { PasswordInputModule } from '@blockframes/ui/form/password-input/password-input.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    
    // Blockframes
    PasswordInputModule
  ],
  declarations: [
    PasswordConfirmComponent
  ],
  exports: [
    PasswordConfirmComponent
  ],
})
export class PasswordConfirmModule { }
