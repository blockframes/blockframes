import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MetricCardListComponent } from './metric-card-list.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

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
