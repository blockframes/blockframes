import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { MinMaxFilterComponent } from './min-max.component';

// Material
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

@NgModule({
  declarations: [MinMaxFilterComponent],
  exports: [MinMaxFilterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class MinMaxFilterModule { }
