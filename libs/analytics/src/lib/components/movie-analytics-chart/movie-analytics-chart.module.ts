import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from "ng-apexcharts";
import { FlexLayoutModule } from '@angular/flex-layout';

import { MovieAnalyticsChartComponent } from './movie-analytics-chart.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [MovieAnalyticsChartComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,
    FlexLayoutModule,
    ImageModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [MovieAnalyticsChartComponent]
})
export class MovieAnalyticsChartModule { }
