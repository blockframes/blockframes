import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmWithValidationComponent } from './confirm-with-validation.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule, 
    FlexLayoutModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  declarations: [ConfirmWithValidationComponent],
  exports: [ConfirmWithValidationComponent]
})
export class ConfirmWithValidationModule { }
