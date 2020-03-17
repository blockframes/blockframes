import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelInputComponent } from './tel-input.component';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule
  ],
  declarations: [TelInputComponent],
  exports: [TelInputComponent]
})
export class TelInputModule { }
