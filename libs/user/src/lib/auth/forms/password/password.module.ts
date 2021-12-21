import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PasswordFormComponent } from './password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordUpdateModule } from '@blockframes/ui/form/password-update/password-update.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [PasswordFormComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    PasswordUpdateModule,
    // Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [PasswordFormComponent]
})
export class PasswordFormModule { }
