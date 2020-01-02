import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { MovieFormBudgetModule } from '@blockframes/movie/movie/form/budget/budget.module';
import { BudgetComponent } from './budget.component';

@NgModule({
  declarations: [BudgetComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MovieFormBudgetModule,
    RouterModule.forChild([{ path: '', component: BudgetComponent }])
  ]
})
export class BudgetModule { }
