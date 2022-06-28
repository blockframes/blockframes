import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BuyerAnalyticsComponent } from './buyer-analytics.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, ToLabelModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { OrgNameModule } from '@blockframes/organization/pipes';
import { MetricCardListModule } from '@blockframes/analytics/components/metric-card-list/metric-card-list.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { BarChartModule } from '@blockframes/analytics/components/bar-chart/bar-chart.module';
import { PieChartModule } from '@blockframes/analytics/components/pie-chart/pie-chart.module';
import { IsWatchingNowPipeModule } from '@blockframes/event/pipes/is-watching-now.pipe';
import { TagModule } from '@blockframes/ui/tag/tag.module';

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
    MetricCardListModule,
    TableModule,
    MaxLengthModule,
    DurationModule,
    BarChartModule,
    PieChartModule,
    IsWatchingNowPipeModule,
    TagModule,
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