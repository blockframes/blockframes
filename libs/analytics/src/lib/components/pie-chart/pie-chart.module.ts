import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Component
import { PieChartComponent } from './pie-chart.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  imports: [
    CommonModule,
    NgApexchartsModule,
    ImageModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    LogoSpinnerModule
  ],
  declarations: [PieChartComponent],
  exports: [PieChartComponent]
})
export class PieChartModule {}
