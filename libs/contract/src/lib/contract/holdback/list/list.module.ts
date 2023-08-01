import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';

import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, } from '@blockframes/utils/pipes';
import { TableModule } from '@blockframes/ui/list/table/table.module';


@NgModule({
  declarations: [ListComponent],
  exports: [ListComponent],
  imports: [
    CommonModule,
    TableModule,
    JoinPipeModule,
    MaxLengthModule,
    ToGroupLabelPipeModule,
  ]
})
export class HoldbackListModule { }
