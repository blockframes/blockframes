import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractListComponent } from './contract-list.component';
import { DisplayNameModule, JoinPipeModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { TableModule } from '@blockframes/ui/list/table/table.module';

@NgModule({
  declarations: [
    ContractListComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    MaxLengthModule,
    JoinPipeModule,
    DisplayNameModule,
    GetTitlePipeModule,
    RouterModule.forChild([{ path: '', component: ContractListComponent }])
  ]
})
export class ContractListModule { }
