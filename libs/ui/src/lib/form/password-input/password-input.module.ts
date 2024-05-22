import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PasswordInputComponent } from './password-input.component';

// Material
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [PasswordInputComponent],
  exports: [PasswordInputComponent],
  imports: [
    ReactiveFormsModule,
    FormsModule,

    // Material
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule
  ]
})
export class PasswordInputModule { }