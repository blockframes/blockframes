// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ListComponent } from './list.component';
import { InvitationItemModule } from '../../components/item/item.module';

// Blockframes
import { FilterByDateModule } from '@blockframes/utils/pipes/filter-by-date.pipe';

// Material
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [ListComponent],
  exports: [ListComponent],
  imports: [
    CommonModule,
    FilterByDateModule,
    InvitationItemModule,

    // Material
    MatListModule,
    MatDividerModule
  ]
})
export class InvitationListModule { }
