import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ListComponent } from './list.component';
import { FilterByDateModule } from '@blockframes/utils/pipes/filter-by-date.pipe';

import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [ListComponent],
  exports: [ListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FilterByDateModule,
    MatListModule,
  ]
})
export class EventListModule { }
