import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { MovieFormBudgetModule } from '@blockframes/movie/form/budget/budget.module';
import { MovieFormSalesInfoModule } from '@blockframes/movie/form/sales-info/sales-info.module';
import { BudgetComponent } from './budget.component';


// Material
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [BudgetComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormBudgetModule,
    MovieFormSalesInfoModule,
    // Material
    MatCardModule,
    // Route
    RouterModule.forChild([{ path: '', component: BudgetComponent }])
  ]
})
export class BudgetModule { }
