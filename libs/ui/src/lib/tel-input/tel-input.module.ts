import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TelInputComponent } from './tel-input.component';

// Material
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

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
