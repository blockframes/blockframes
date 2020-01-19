import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TitleAvailsComponent } from './avails.component';

import { DistributionDealSelectionMapModule } from '@blockframes/movie/distribution-deals/selection-map/selection-map.module';

@NgModule({
  declarations: [TitleAvailsComponent],
  imports: [
    CommonModule,
    DistributionDealSelectionMapModule,
    RouterModule.forChild([{ path: '', component: TitleAvailsComponent }])
  ]
})
export class TitleAvailsModule { }
