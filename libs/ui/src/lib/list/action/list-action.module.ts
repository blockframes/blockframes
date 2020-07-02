// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import {
  ListActionComponent,
  ListActionHeaderDirective,
  ListActionMenuDirective,
  ListActionButtonsDirective,
  ListActionItemDirective,
  ListActionPaginationDirective
} from './list-action.component';

// Material
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Material
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  exports: [
    ListActionComponent,
    ListActionHeaderDirective,
    ListActionMenuDirective,
    ListActionButtonsDirective,
    ListActionItemDirective,
    ListActionPaginationDirective,
  ],
  declarations: [
    ListActionComponent,
    ListActionHeaderDirective,
    ListActionMenuDirective,
    ListActionButtonsDirective,
    ListActionItemDirective,
    ListActionPaginationDirective
  ],
})
export class ListActionModule { }
