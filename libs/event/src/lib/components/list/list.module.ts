import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ListComponent } from './list.component';
import { FilterByDateModule } from '@blockframes/utils/pipes/filter-by-date.pipe';

import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';

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
