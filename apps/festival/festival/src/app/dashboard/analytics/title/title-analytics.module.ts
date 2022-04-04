import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TitleAnalyticsComponent } from './title-analytics.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';
import { PieChartModule } from '@blockframes/analytics/components/pie-chart/pie-chart.module';
import { AnalyticsMapModule } from '@blockframes/analytics/components/map/map.module';
import { TableModule } from "@blockframes/ui/list/table/table.module";

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    // Material
    MatButtonModule,
    MatIconModule,
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
export class TitleAnalyticsModule {}