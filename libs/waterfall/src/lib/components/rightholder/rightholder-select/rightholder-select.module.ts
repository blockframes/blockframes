import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { RightholderSelectComponent } from './rightholder-select.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

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
