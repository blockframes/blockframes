import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from "ng-apexcharts";
import { FlexLayoutModule } from '@angular/flex-layout';
import { MovieAnalyticsChartModule } from '@blockframes/analytics/components/movie-analytics-chart/movie-analytics-chart.module';

import { TitleActivityComponent } from './activity.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [TitleActivityComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,
    FlexLayoutModule,
    MovieAnalyticsChartModule,
    // Material
    MatCardModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: TitleActivityComponent }])
  ]
})
export class TitleActivityModule {}
