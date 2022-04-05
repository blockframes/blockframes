import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BuyerAnalyticsComponent } from './buyer-analytics.component';

@NgModule({
  imports: [
    CommonModule,
  
    // Router
    RouterModule.forChild([
      {
        path: '',
        component: BuyerAnalyticsComponent
      }
    ])
  ],
  declarations: [BuyerAnalyticsComponent]
})
export class BuyerAnalyticsModule {}