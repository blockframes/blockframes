import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OverlayWidgetModule } from '../overlay-widget';

import { SearchWidgetComponent } from './search-widget.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [SearchWidgetComponent],
  exports: [SearchWidgetComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    OverlayWidgetModule,
    FormsModule,
    ReactiveFormsModule,
    // Material
    MatIconModule,
    MatButtonModule,
    MatListModule
  ]
})
export class SearchWidgetModule {}
