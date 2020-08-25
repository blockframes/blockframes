// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { MovieFormBudgetComponent } from './budget.component';

// Material
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  declarations: [MovieFormBudgetComponent],
  exports: [MovieFormBudgetComponent]
})
export class MovieFormBudgetModule { }
