import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { MovieFormSalesInfoModule } from '@blockframes/movie/movie/form/sales-info/sales-info.module';
import { BudgetComponent } from './budget.component';

// Forms
import { MovieFormEstimatedBudgetModule } from '@blockframes/movie/movie/form/budget/estimated-budget/estimated-budget.module';
import { MovieFormBoxOfficeModule } from '@blockframes/movie/movie/form/budget/box-office/box-office.module';


// Material
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [BudgetComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormEstimatedBudgetModule,
    MovieFormBoxOfficeModule,
    MovieFormSalesInfoModule,
    // Material
    MatCardModule,
    // Route
    RouterModule.forChild([{ path: '', component: BudgetComponent }])
  ]
})
export class BudgetModule { }
