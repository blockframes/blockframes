// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { FilterButtonComponent } from './filter-button.component';
import { OverlayWidgetModule } from '../overlay-widget';

//Material
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    OverlayWidgetModule,
    MatRippleModule
  ],
  exports: [FilterButtonComponent],
  declarations: [FilterButtonComponent],
})
export class FilterButtonModule { }
