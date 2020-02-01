import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OverlayWidgetModule } from '../overlay-widget';

import { SearchWidgetComponent } from './search-widget.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [SearchWidgetComponent],
  exports: [SearchWidgetComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    OverlayWidgetModule,
    // Material
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
  ]
})
export class SearchWidgetModule { }
