import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { VersionTableComponent } from './table.component';



@NgModule({
  declarations: [VersionTableComponent],
  exports: [VersionTableComponent],
  imports: [
    CommonModule,
    TableFilterModule
  ]
})
export class VersionTableModule { }
