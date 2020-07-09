import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { NotificationItemModule } from '../item/item.module';

import { MatListModule } from '@angular/material/list';

import { FilterByDateModule } from '@blockframes/utils/pipes/filter-by-date.pipe';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [ListComponent],
  exports: [ListComponent],
  imports: [
    CommonModule,
    FilterByDateModule,
    NotificationItemModule,
    MatListModule,
    MatPaginatorModule
  ]
})
export class NotificationListModule { }
