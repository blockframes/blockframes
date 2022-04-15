import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from "ng-apexcharts";
import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { LineChartComponent } from './line-chart.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    NgApexchartsModule,
    ImageModule,

    MatIconModule,
    MatButtonModule,
  ],
  declarations: [LineChartComponent],
  exports: [LineChartComponent]
})
export class LineChartModule {}
