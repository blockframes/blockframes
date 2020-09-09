// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Component
import { MovieFormBudgetRangeComponent } from './budget-range.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatFormFieldModule,
    MatSelectModule,
  ],
  declarations: [MovieFormBudgetRangeComponent],
  exports: [MovieFormBudgetRangeComponent]
})
export class MovieFormBudgetRangeModule { }
