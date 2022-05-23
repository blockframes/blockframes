import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { PasswordFormComponent } from './change-password.component';
import { PasswordInputModule } from '@blockframes/ui/form/password-input/password-input.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [PasswordFormComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    PasswordInputModule,
    // Material
    MatCardModule,
    MatFormFieldModule,
  ],
  exports: [PasswordFormComponent]
})
export class PasswordFormModule { }
