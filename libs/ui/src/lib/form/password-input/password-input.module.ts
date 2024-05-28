import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PasswordInputComponent } from './password-input.component';

// Material
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

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