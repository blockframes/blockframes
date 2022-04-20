import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieAnalyticsChartModule } from '@blockframes/analytics/components/movie-analytics-chart/movie-analytics-chart.module';

import { TitleActivityComponent } from './activity.component';

@NgModule({
  declarations: [TitleActivityComponent],
  imports: [
    CommonModule,
    MovieAnalyticsChartModule,
    RouterModule.forChild([{ path: '', component: TitleActivityComponent }])
  ]
})
export class TitleActivityModule {}
