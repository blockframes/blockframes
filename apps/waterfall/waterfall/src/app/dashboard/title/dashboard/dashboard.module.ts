// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';

// Pages
import { DashboardComponent } from './dashboard.component';

// Blockframes
import { DashboardCardModule } from '@blockframes/waterfall/components/dashboard-card/dashboard-card.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,

    DashboardCardModule,
    ImageModule,

    // Material
    MatDividerModule,
    MatButtonModule,

    // Routing
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
  ],
})
export class DashboardModule { }
