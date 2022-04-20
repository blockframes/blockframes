import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BuyerAnalyticsComponent } from './buyer-analytics.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, ToLabelModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { OrgNameModule } from '@blockframes/organization/pipes';
import { MetricCardModule } from '@blockframes/analytics/components/metric-card/metric-card.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';

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
    OrgNameModule,
    ToLabelModule,
    MetricCardModule,
    TableModule,
    MaxLengthModule,
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