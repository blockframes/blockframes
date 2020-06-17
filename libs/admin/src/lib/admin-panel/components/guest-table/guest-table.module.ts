import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

// Components 
import { GuestTableComponent } from './guest-table.component';

@NgModule({
  declarations: [GuestTableComponent],
  exports: [GuestTableComponent],
  imports: [
    CommonModule,
    TableFilterModule,
  ]
})
export class GuestTableModule { }
