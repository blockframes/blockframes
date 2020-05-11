import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TitleSalesComponent } from './sales.component';

import { DistributionRightSelectionMapModule } from '@blockframes/distribution-rights/components/selection-map/selection-map.module';
import { ContractListModule } from '@blockframes/contract/contract/list/contract-list.module';

@NgModule({
  declarations: [TitleSalesComponent],
  imports: [
    CommonModule,
    DistributionRightSelectionMapModule,
    ContractListModule,
    RouterModule.forChild([{ path: '', component: TitleSalesComponent }])
  ]
})
export class TitleSalesModule { }
