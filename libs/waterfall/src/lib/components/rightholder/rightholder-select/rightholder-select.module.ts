import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { RightholderSelectComponent } from './rightholder-select.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

@NgModule({
  declarations: [
    RightholderSelectComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Material
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  exports: [
    RightholderSelectComponent
  ]
})
export class RightholderSelectModule { }
