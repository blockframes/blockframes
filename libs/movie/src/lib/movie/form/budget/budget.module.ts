import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { BoxOfficeComponent } from './box-office/box-office.component';
import { EstimatedBudgetComponent } from './estimated-budget/estimated-budget.component';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [EstimatedBudgetComponent, BoxOfficeComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    FormsModule,
  ],
  exports: [EstimatedBudgetComponent, BoxOfficeComponent]
})
export class MovieFormBudgetModule { }
