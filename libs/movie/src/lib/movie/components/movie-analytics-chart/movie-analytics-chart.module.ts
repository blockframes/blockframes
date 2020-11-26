import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from "ng-apexcharts";
import { FlexLayoutModule } from '@angular/flex-layout';

import { MovieAnalyticsChartComponent } from './movie-analytics-chart.component';
import { LineChartModule } from '@blockframes/ui/charts/line-chart/line-chart.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [MovieAnalyticsChartComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,
    FlexLayoutModule,
    LineChartModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  exports: [MovieAnalyticsChartComponent]
})
export class MovieAnalyticsChartModule { }
