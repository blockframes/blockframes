import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SellerAnalyticsComponent } from './seller-analytics.component';

@NgModule({
  imports: [
    CommonModule,
  
    // Router
    RouterModule.forChild([
      {
        path: '',
        component: SellerAnalyticsComponent
      }
    ])
  ],
  declarations: [SellerAnalyticsComponent]
})
export class SellerAnalyticsModule {}