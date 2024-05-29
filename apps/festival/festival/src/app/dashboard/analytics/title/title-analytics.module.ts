import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
// Component
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

import { LineChartModule } from '@blockframes/analytics/components/line-chart/line-chart.module';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { IsWatchingNowPipeModule } from '@blockframes/event/pipes/is-watching-now.pipe';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
    IsWatchingNowPipeModule,
    TagModule,
    LogoSpinnerModule,

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
