import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { RunningTimeFilterComponent } from './running-time.component';

// Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [RunningTimeFilterComponent],
  exports: [RunningTimeFilterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Material
    MatInputModule,
    MatFormFieldModule,
  ],
})
export class RunningTimeFilterModule { }
