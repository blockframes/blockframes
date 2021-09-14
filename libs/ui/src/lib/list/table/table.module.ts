import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableFilterComponent, ColumnDirective } from './table.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [TableComponent, TableFilterComponent, ColumnDirective],
  exports: [TableComponent, TableFilterComponent, ColumnDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    DeepKeyPipeModule,
  ]
})
export class TableModule { }
