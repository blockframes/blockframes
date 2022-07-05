import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Materials
import { MatIconModule } from '@angular/material/icon';

// Modules
import { ToLabelModule } from '@blockframes/utils/pipes';
// Components
import { GuestTableComponent } from './guest-table.component';
import { TableModule } from '@blockframes/ui/list/table/table.module';

@NgModule({
  declarations: [GuestTableComponent],
  exports: [GuestTableComponent],
  imports: [
    CommonModule,
    TableModule,
    MatIconModule,
    RouterModule,
    ToLabelModule
  ]
})
export class GuestTableModule { }
