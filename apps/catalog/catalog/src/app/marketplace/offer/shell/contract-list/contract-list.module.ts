import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractListComponent } from './contract-list.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

@NgModule({
  declarations: [
    ContractListComponent
  ],
  imports: [
    CommonModule,
    TableFilterModule,
    RouterModule.forChild([{ path: '', component: ContractListComponent }])
  ]
})
export class ContractListModule { }
