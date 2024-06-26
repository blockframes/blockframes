
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallRevenueSimulationComponent } from './revenue-simulation.component';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [WaterfallRevenueSimulationComponent],
  imports: [
    CommonModule,

    // Material
    MatButtonModule
  ],
  exports: [WaterfallRevenueSimulationComponent],
})
export class WaterfallRevenueSimulationModule { }
