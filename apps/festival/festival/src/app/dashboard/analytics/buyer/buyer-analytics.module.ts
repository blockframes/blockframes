import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BuyerAnalyticsComponent } from './buyer-analytics.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';
import { OrgNameModule } from '@blockframes/organization/pipes';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    // Blockframes
    ImageModule,
    DisplayNameModule,
    OrgNameModule,
    ToLabelModule,
    // Material
    MatButtonModule,
    MatIconModule,
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