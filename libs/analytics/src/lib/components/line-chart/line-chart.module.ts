import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgApexchartsModule } from "ng-apexcharts";

import { LineChartComponent } from './line-chart.component';

import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    NgApexchartsModule,
    MatIconModule
  ],
  declarations: [LineChartComponent],
  exports: [LineChartComponent]
})
export class LineChartModule {}
