import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ConfirmWithValidationComponent } from './confirm-with-validation.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule, 
    MatIconModule,
    MatCheckboxModule,
  ],
  declarations: [ConfirmWithValidationComponent],
  exports: [ConfirmWithValidationComponent]
})
export class ConfirmWithValidationModule { }
