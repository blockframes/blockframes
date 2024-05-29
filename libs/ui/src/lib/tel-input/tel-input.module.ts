import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TelInputComponent } from './tel-input.component';

// Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    
    // Material
    MatInputModule,
    MatFormFieldModule
  ],
  declarations: [TelInputComponent],
  exports: [TelInputComponent]
})
export class TelInputModule { }
