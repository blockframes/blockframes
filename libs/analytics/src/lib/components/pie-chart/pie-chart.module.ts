import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from "ng-apexcharts";
import { ImageModule } from "@blockframes/media/image/directives/image.module";

import { PieChartComponent } from './pie-chart.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    NgApexchartsModule,
    ImageModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  declarations: [PieChartComponent],
  exports: [PieChartComponent]
})
export class PieChartModule {}
