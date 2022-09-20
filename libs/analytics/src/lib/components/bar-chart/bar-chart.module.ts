import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgApexchartsModule } from "ng-apexcharts";

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ImageModule } from "@blockframes/media/image/directives/image.module";

// Component
import { BarChartComponent } from "./bar-chart.component";

// Material
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    NgApexchartsModule,

    ImageModule,
    LogoSpinnerModule,

    MatIconModule,
  ],
  declarations: [BarChartComponent],
  exports: [BarChartComponent]
})
export class BarChartModule { }