import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Component
import { LineChartComponent } from './line-chart.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    NgApexchartsModule,
    ImageModule,
    LogoSpinnerModule,

    MatIconModule,
    MatButtonModule
  ],
  declarations: [LineChartComponent],
  exports: [LineChartComponent]
})
export class LineChartModule {}
