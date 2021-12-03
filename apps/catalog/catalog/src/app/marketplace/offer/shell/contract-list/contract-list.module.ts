import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContractListComponent, NegotiationStagePipe } from './contract-list.component';
import { DisplayNameModule, JoinPipeModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { MatTooltipModule } from '@angular/material/tooltip'

@NgModule({
  declarations: [
    ContractListComponent,
    NegotiationStagePipe
  ],
  imports: [
    CommonModule,
    TagModule,
    TableModule,
    MatTooltipModule,
    MaxLengthModule,
    JoinPipeModule,
    DisplayNameModule,
    GetTitlePipeModule,
    RouterModule.forChild([{ path: '', component: ContractListComponent }])
  ],
  providers: [NegotiationStagePipe]
})
export class ContractListModule { }
