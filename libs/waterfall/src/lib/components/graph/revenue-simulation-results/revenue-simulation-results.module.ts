import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallRevenueSimulationResultsComponent } from './revenue-simulation-results.component';

// Material
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [WaterfallRevenueSimulationResultsComponent],
  imports: [
    CommonModule,

    // Material
    MatDividerModule,
  ],
  exports: [WaterfallRevenueSimulationResultsComponent],
})
export class WaterfallRevenueSimulationResultsModule { }
