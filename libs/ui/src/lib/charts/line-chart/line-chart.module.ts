import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LineChartComponent } from './line-chart.component';


@NgModule({
  declarations: [LineChartComponent],
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  exports: [LineChartComponent]
})
export class LineChartModule { }
