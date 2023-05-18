// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { BudgetComponent } from './budget.component';

@NgModule({
  declarations: [BudgetComponent],
  imports: [
    CommonModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: BudgetComponent }]),
  ],
})
export class BudgetModule { }
