import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MetricCardListComponent } from './metric-card-list.component';

// Material
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    // Material
    MatIconModule
  ],
  declarations: [MetricCardListComponent],
  exports: [MetricCardListComponent]
})
export class MetricCardListModule {}