import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgApexchartsModule } from "ng-apexcharts";

import { ImageModule } from "@blockframes/media/image/directives/image.module";

import { BarChartComponent } from "./bar-chart.component";

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  imports: [
    CommonModule,
    NgApexchartsModule,

    ImageModule,

    MatIconModule,
    MatProgressSpinnerModule
  ],
  declarations: [BarChartComponent],
  exports: [BarChartComponent]
})
export class BarChartModule {}