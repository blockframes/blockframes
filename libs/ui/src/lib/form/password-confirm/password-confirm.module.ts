import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Components
import { PasswordConfirmComponent } from './password-confirm.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

// @Blockframes
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
    MatIconModule,
    MatTooltipModule,
    
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
