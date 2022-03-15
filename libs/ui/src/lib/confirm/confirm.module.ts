import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmComponent } from './confirm.component';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ConfirmComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule, 
    FlexLayoutModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  exports: [ConfirmComponent]
})
export class ConfirmModule { }
