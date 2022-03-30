import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgApexchartsModule } from "ng-apexcharts";
import { ImageModule } from "@blockframes/media/image/directives/image.module";

import { PieChartComponent } from './pie-chart.component';

import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    NgApexchartsModule,
    MatIconModule,
    ImageModule,
  ],
  declarations: [PieChartComponent],
  exports: [PieChartComponent]
})
export class PieChartModule {}
