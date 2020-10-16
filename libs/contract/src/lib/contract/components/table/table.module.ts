import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractTableComponent } from './table.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget';
import { ToLabelModule } from '@blockframes/utils/pipes';


@NgModule({
  declarations: [ContractTableComponent],
  exports: [ContractTableComponent],
  imports: [
    CommonModule,
    TableFilterModule,
    OverlayWidgetModule,
    ToLabelModule
  ]
})
export class ContractTableModule { }
