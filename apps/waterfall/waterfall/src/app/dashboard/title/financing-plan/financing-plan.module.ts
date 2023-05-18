// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { FinancingPlanComponent } from './financing-plan.component';

@NgModule({
  declarations: [FinancingPlanComponent],
  imports: [
    CommonModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: FinancingPlanComponent }]),
  ],
})
export class FinancingPlanModule { }
