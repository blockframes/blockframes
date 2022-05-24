import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BuyerAnalyticsComponent } from './buyer-analytics.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, ToLabelModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { MetricCardListModule } from '@blockframes/analytics/components/metric-card-list/metric-card-list.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    // Blockframes
    ImageModule,
    DisplayNameModule,
    ToLabelModule,
    MetricCardListModule,
    TableModule,
    MaxLengthModule,
    DurationModule,
    // Material
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    // Router
    RouterModule.forChild([
      {
        path: '',
        component: BuyerAnalyticsComponent
      }
    ])
  ],
  declarations: [BuyerAnalyticsComponent]
})
export class BuyerAnalyticsModule {}