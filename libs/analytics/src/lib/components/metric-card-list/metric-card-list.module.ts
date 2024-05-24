import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MetricCardListComponent } from './metric-card-list.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    // Material
    MatTooltipModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [MetricCardListComponent],
  exports: [MetricCardListComponent]
})
export class MetricCardListModule {}
