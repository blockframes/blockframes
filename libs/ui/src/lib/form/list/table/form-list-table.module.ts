// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FormListTableComponent } from './form-list-table.component';
import { ColRef } from './form-list-table.component';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  imports: [
    CommonModule,

    // Material
    MatTableModule,
    MatPaginatorModule
  ],
  declarations: [FormListTableComponent, ColRef],
  exports: [FormListTableComponent, ColRef]
})
export class FormListTableModule { }
