import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Materials
import { MatIconModule } from '@angular/material/icon';

// Modules
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';

// Components 
import { GuestTableComponent } from './guest-table.component';

@NgModule({
  declarations: [GuestTableComponent],
  exports: [GuestTableComponent],
  imports: [
    CommonModule,
    TableFilterModule,
    OrgNameModule,
    MatIconModule,
    RouterModule,
  ]
})
export class GuestTableModule { }
