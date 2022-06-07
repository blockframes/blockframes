import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BuyersAnalyticsComponent } from './buyers-analytics.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';
import { PieChartModule } from '@blockframes/analytics/components/pie-chart/pie-chart.module';
import { MatIconModule } from '@angular/material/icon';
import { MetricCardListModule } from '@blockframes/analytics/components/metric-card-list/metric-card-list.module';

@NgModule({
  imports: [
    CommonModule,
    // Blockframes
    TableModule,
    ToLabelModule,
    DisplayNameModule,
    PieChartModule,
    MetricCardListModule,

    //material
    MatIconModule,

    // Router
    RouterModule.forChild([
      {
        path: '',
        component: BuyersAnalyticsComponent
      }
    ])
  ],
  declarations: [BuyersAnalyticsComponent]
})
export class BuyersAnalyticsModule {}
