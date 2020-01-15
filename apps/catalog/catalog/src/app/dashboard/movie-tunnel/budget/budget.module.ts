import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { MovieFormBudgetModule } from '@blockframes/movie/movie/form/budget/budget.module';
import { MovieFormSalesInfoModule } from '@blockframes/movie/movie/form/sales-info/sales-info.module';
import { BudgetComponent } from './budget.component';


// Material
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [BudgetComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormBudgetModule,
    MovieFormSalesInfoModule,
    // Material
    MatExpansionModule,
    // Route
    RouterModule.forChild([{ path: '', component: BudgetComponent }])
  ]
})
export class BudgetModule { }
