// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FormListTableComponent } from './form-list-table.component';

// Blockframes
import { ColRefModule } from '@blockframes/utils/directives/col-ref.directive';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    ColRefModule,

    // Material
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
  ],
  declarations: [FormListTableComponent],
  exports: [FormListTableComponent, ColRefModule]
})
export class FormListTableModule { }