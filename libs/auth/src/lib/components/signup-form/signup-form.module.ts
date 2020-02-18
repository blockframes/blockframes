import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { PasswordConfirmModule } from '@blockframes/ui/form';
import { AcceptConditionsModule } from '../accept-conditions/accept-conditions.module';
import { TermsConditionsModule } from '../terms-conditions/terms-conditions.module';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Component
import { SignupFormComponent } from './signup-form.component';


@NgModule({
  declarations: [SignupFormComponent],
  exports: [SignupFormComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    PasswordConfirmModule,
    AcceptConditionsModule,
    TermsConditionsModule,

    // Material
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class SignupFormModule {}
