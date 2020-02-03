import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TitleAvailsComponent } from './avails.component';

import { DistributionDealSelectionMapModule } from '@blockframes/movie/distribution-deals/selection-map/selection-map.module';
import { ContractListModule } from '@blockframes/contract/contract/list/contract-list.module';

@NgModule({
  declarations: [TitleAvailsComponent],
  imports: [
    CommonModule,
    DistributionDealSelectionMapModule,
    ContractListModule,
    RouterModule.forChild([{ path: '', component: TitleAvailsComponent }])
  ]
})
export class TitleAvailsModule { }
