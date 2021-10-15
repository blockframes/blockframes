import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';

import { StaticGroupModule } from '@blockframes/ui/static-autocomplete/group/group.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, ToLabelModule, VersionPipeModule } from '@blockframes/utils/pipes';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';


@NgModule({
  declarations: [ListComponent],
  exports: [ListComponent],
  imports: [
    CommonModule,
    TableFilterModule,
    StaticGroupModule,
    JoinPipeModule,
    MaxLengthModule,
    ToGroupLabelPipeModule,
  ]
})
export class HoldbackListModule { }
