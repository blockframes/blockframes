import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BuyersAnalyticsComponent } from './buyers-analytics.component';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';

@NgModule({
  imports: [
    CommonModule,
    // Blockframes
    TableModule,
    ToLabelModule,
    DisplayNameModule,
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