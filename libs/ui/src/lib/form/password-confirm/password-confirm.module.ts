import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Components
import { PasswordConfirmComponent } from './password-confirm.component';

// Material
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

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
