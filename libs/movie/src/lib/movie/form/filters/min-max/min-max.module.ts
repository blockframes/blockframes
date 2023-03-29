import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { MinMaxFilterComponent } from './min-max.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
