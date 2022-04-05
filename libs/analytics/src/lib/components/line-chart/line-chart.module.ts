import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgApexchartsModule } from "ng-apexcharts";
import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { LineChartComponent } from './line-chart.component';

import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    NgApexchartsModule,
    MatIconModule,
    ImageModule,
  ],
  declarations: [LineChartComponent],
  exports: [LineChartComponent]
})
export class LineChartModule {}
