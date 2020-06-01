import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from "ng-apexcharts";
import { FlexLayoutModule } from '@angular/flex-layout';

import { MovieAnalyticsChartComponent } from './movie-analytics-chart.component';

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
    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  exports: [MovieAnalyticsChartComponent]
})
export class MovieAnalyticsChartModule { }
