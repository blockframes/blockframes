// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FormTableComponent, FormViewDirective } from './form-table.component';

// Blockframes
import { ColRefModule } from '@blockframes/utils/directives/col-ref.directive';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    ColRefModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatDividerModule
  ],
  declarations: [FormTableComponent, FormViewDirective],
  exports: [FormTableComponent, FormViewDirective, ColRefModule]
})
export class FormTableModule { }
