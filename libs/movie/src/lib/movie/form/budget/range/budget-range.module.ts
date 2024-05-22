// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Component
import { MovieFormBudgetRangeComponent } from './budget-range.component';

import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToLabelModule,

    // Material
    MatFormFieldModule,
    MatSelectModule,
  ],
  declarations: [MovieFormBudgetRangeComponent],
  exports: [MovieFormBudgetRangeComponent]
})
export class MovieFormBudgetRangeModule { }
