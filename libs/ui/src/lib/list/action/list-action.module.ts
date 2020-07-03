// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FilterByDateModule } from '@blockframes/utils/pipes';

// Components
import {
  ListActionComponent,
  ListActionItemDirective,
  ListActionHeaderDirective,
  ListActionPaginationDirective,
  ListActionMenuDirective
} from './list-action.component';

// Material
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FilterByDateModule,

    // Material
    MatListModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatMenuModule
  ],
  exports: [
    ListActionComponent,
    ListActionItemDirective,
    ListActionHeaderDirective,
    ListActionPaginationDirective,
    ListActionMenuDirective,
  ],
  declarations: [
    ListActionComponent,
    ListActionItemDirective,
    ListActionHeaderDirective,
    ListActionPaginationDirective,
    ListActionMenuDirective
  ],
})
export class ListActionModule { }
