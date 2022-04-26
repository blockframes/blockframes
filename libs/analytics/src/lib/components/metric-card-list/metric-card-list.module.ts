import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MetricCardListComponent } from './metric-card-list.component';
import { MetricCardComponent } from './metric-card/metric-card.component';

@NgModule({
  imports: [
    CommonModule,
    // Material
    MatIconModule
  ],
  declarations: [
    MetricCardListComponent,
    MetricCardComponent
  ],
  exports: [
    MetricCardListComponent,
    MetricCardComponent
  ]
})
export class MetricCardListModule {}