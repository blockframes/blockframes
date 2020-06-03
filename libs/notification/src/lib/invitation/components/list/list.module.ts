import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { InvitationItemModule } from '../../components/item/item.module';

import { MatListModule } from '@angular/material/list';

import { FilterByDateModule } from '@blockframes/utils/pipes/filter-by-date.pipe';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [ListComponent],
  exports: [ListComponent],
  imports: [
    CommonModule,
    FilterByDateModule,
    InvitationItemModule,
    MatListModule,
    MatDividerModule
  ]
})
export class InvitationListModule { }
