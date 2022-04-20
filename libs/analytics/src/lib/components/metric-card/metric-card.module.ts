import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MetricCardComponent } from './metric-card.component';

@NgModule({
  imports: [
    CommonModule,
    // Material
    MatIconModule
  ],
  declarations: [MetricCardComponent],
  exports: [MetricCardComponent]
})
export class MetricCardModule {}