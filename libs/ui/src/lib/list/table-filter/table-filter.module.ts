import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OverlayWidgetModule } from '../../overlay-widget/overlay-widget.module';

import { TableFilterComponent, ColRef } from './table-filter.component';

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
  declarations: [TableFilterComponent, ColRef],
  exports: [TableFilterComponent, ColRef],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayWidgetModule,
    RouterModule,
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
