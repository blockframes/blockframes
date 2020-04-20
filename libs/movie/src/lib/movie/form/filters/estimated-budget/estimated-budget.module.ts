import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { EstimatedBudgetFilterComponent } from './estimated-budget.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  declarations: [EstimatedBudgetFilterComponent],
  exports: [EstimatedBudgetFilterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Material
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
  ],
})
export class EstimatedBudgetFilterModule { }
