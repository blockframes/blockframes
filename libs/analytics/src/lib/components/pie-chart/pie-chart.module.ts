import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgApexchartsModule } from "ng-apexcharts";

import { PieChartComponent } from './pie-chart.component';

import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    NgApexchartsModule,
    MatIconModule
  ],
  declarations: [PieChartComponent],
  exports: [PieChartComponent]
})
export class PieChartModule {}