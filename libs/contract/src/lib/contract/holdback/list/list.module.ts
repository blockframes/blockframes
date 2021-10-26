import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';

import { StaticGroupModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, } from '@blockframes/utils/pipes';
import { TableModule } from '@blockframes/ui/list/table/table.module';


@NgModule({
  declarations: [ListComponent],
  exports: [ListComponent],
  imports: [
    CommonModule,
    TableModule,
    StaticGroupModule,
    JoinPipeModule,
    MaxLengthModule,
    ToGroupLabelPipeModule,
  ]
})
export class HoldbackListModule { }
