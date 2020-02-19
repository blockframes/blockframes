import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TitleAvailsComponent } from './avails.component';

import { DistributionDealSelectionMapModule } from '@blockframes/movie/distribution-deals/components/selection-map/selection-map.module';
import { ContractTableModule } from '@blockframes/contract/contract/components';

@NgModule({
  declarations: [TitleAvailsComponent],
  imports: [
    CommonModule,
    DistributionDealSelectionMapModule,
    ContractTableModule,
    RouterModule.forChild([{ path: '', component: TitleAvailsComponent }])
  ]
})
export class TitleAvailsModule { }
