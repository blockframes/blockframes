import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TitleAnalyticsComponent } from './title-analytics.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';
import { PieChartModule } from '@blockframes/analytics/components/pie-chart/pie-chart.module';
import { AnalyticsMapModule } from '@blockframes/analytics/components/map/map.module';
import { TableModule } from "@blockframes/ui/list/table/table.module";
import { OngoingButtonModule } from '@blockframes/ui/ongoing-button/ongoing-button.module';
import { MetricCardListModule } from '@blockframes/analytics/components/metric-card-list/metric-card-list.module';
import { GuestPipeModule } from '@blockframes/invitation/pipes/guest.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LineChartModule } from '@blockframes/analytics/components/line-chart/line-chart.module';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Blockframes
    ImageModule,
    DisplayNameModule,
    ToLabelModule,
    PieChartModule,
    AnalyticsMapModule,
    TableModule,
    MetricCardListModule,
    OngoingButtonModule,
    GuestPipeModule,
    LineChartModule,
    DurationModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,

    // Router
    RouterModule.forChild([
      {
        path: '',
        component: TitleAnalyticsComponent
      }
    ])
  ],
  declarations: [TitleAnalyticsComponent]
})
export class TitleAnalyticsModule { }
