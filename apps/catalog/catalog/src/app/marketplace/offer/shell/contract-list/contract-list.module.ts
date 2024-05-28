import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractListComponent } from './contract-list.component';

import { DisplayNameModule, JoinPipeModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { NegotiationPipeModule } from '@blockframes/contract/negotiation/pipe'
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

import { MatTooltipModule } from '@angular/material/tooltip'
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    ContractListComponent
  ],
  imports: [
    CommonModule,
    TagModule,
    TableModule,
    ToLabelModule,
    MatIconModule,
    MatTooltipModule,
    MaxLengthModule,
    JoinPipeModule,
    NegotiationPipeModule,
    DisplayNameModule,
    GetTitlePipeModule,
    RouterModule.forChild([{ path: '', component: ContractListComponent }])
  ],
})
export class ContractListModule { }
