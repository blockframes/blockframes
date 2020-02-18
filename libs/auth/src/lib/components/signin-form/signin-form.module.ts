import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Component
import { SigninFormComponent } from './signin-form.component';


@NgModule({
  declarations: [SigninFormComponent],
  exports: [SigninFormComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    // Material
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class SigninFormModule {}
