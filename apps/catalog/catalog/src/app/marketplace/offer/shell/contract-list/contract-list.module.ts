import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractListComponent } from './contract-list.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { DisplayNameModule, JoinPipeModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';

@NgModule({
  declarations: [
    ContractListComponent
  ],
  imports: [
    CommonModule,
    TableFilterModule,
    MaxLengthModule,
    JoinPipeModule,
    DisplayNameModule,
    GetTitlePipeModule,
    RouterModule.forChild([{ path: '', component: ContractListComponent }])
  ]
})
export class ContractListModule { }
