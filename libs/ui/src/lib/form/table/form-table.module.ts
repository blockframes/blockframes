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
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
