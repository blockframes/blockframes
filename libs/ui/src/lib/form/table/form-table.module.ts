// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { FormTableComponent, FormViewDirective } from './form-table.component';
import { LineButtonModule } from '../line-button/line-button.module';

// Blockframes
import { ColRefModule } from '@blockframes/utils/directives/col-ref.directive';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  imports: [
    CommonModule,
    ColRefModule,
    LineButtonModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule
  ],
  declarations: [FormTableComponent, FormViewDirective],
  exports: [FormTableComponent, FormViewDirective, ColRefModule]
})
export class FormTableModule { }
