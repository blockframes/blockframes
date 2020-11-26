import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from "ng-apexcharts";;
import { BasicColumnChartComponent } from './basic-column-chart.component';

@NgModule({
  declarations: [BasicColumnChartComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,
  ],
  exports: [BasicColumnChartComponent]
})

export class BasicColumnChartModule { }
