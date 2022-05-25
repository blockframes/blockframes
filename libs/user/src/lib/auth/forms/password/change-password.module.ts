import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

// Page
import { ChangePasswordComponent } from './change-password.component';

// Modules
import { PasswordInputModule } from '@blockframes/ui/form/password-input/password-input.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [ChangePasswordComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    // Modules
    PasswordInputModule,

    // Material
    MatCardModule,
    MatFormFieldModule
  ],
  exports: [ChangePasswordComponent]
})
export class ChangePasswordModule { }
