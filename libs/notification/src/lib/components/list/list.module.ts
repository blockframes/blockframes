import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { NotificationItemModule } from '../item/item.module';

import { MatListModule } from '@angular/material/list';

import { FilterByDateModule } from '@blockframes/utils/pipes/filter-by-date.pipe';

@NgModule({
  declarations: [ListComponent],
  exports: [ListComponent],
  imports: [
    CommonModule,
    FilterByDateModule,
    NotificationItemModule,
    MatListModule
  ]
})
export class NotificationListModule { }
