// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { FormTableComponent, FormViewDirective, QueryListFindPipe } from './form-table.component';

// Blockframes
import { ColRefModule } from '@blockframes/utils/directives/col-ref.directive';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';
import { ButtonTextModule } from '@blockframes/utils/directives/button-text.directive';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TableModule } from '../../list/table/table.module';

@NgModule({
  imports: [
    CommonModule,
    ColRefModule,
    FlexLayoutModule,
    DeepKeyPipeModule,
    ButtonTextModule,
    TableModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  declarations: [FormTableComponent, FormViewDirective, QueryListFindPipe],
  exports: [FormTableComponent, FormViewDirective, TableModule, ButtonTextModule]
})
export class FormTableModule { }
