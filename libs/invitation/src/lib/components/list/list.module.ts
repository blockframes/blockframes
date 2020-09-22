// Angular
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

// Components
import { ListComponent } from './list.component';
import { InvitationItemModule } from '../../components/item/item.module';

// Blockframes
import { FilterByDateModule } from '@blockframes/utils/pipes/filter-by-date.pipe';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [ListComponent],
  exports: [ListComponent],
  imports: [
    CommonModule,
    FilterByDateModule,
    InvitationItemModule,

    // Material
    MatListModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule
  ]
})
export class InvitationListModule { }
