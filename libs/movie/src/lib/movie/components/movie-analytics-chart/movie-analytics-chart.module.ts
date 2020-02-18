import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from "ng-apexcharts";
import { FlexLayoutModule } from '@angular/flex-layout';

import { MovieAnalyticsChartComponent } from './movie-analytics-chart.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [MovieAnalyticsChartComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,
    FlexLayoutModule,
    // Material
    MatCardModule,
    MatIconModule,
  ],
  exports: [MovieAnalyticsChartComponent]
})
export class MovieAnalyticsChartModule { }
