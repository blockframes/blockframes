import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TableFilterComponent } from './table-filter.component';
import { OverlayWidgetModule } from '../../overlay-widget/overlay-widget.module';
import { ColRefModule } from '@blockframes/utils/directives/col-ref.directive';
import { QueryListFindModule } from '@blockframes/utils/pipes/find.pipe';
import { DeepKeyPipeModule } from '@blockframes/utils/pipes';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [TableFilterComponent],
  exports: [TableFilterComponent, ColRefModule],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayWidgetModule,
    RouterModule,
    FlexLayoutModule,
    ColRefModule,
    QueryListFindModule,
    DeepKeyPipeModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
  ]
})
export class TableFilterModule { }
