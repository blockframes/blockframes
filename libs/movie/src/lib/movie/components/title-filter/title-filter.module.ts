import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TitleFilterComponent, FilterDirective } from './title-filter.component';

// Material
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget/overlay-widget.module';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [TitleFilterComponent, FilterDirective],
  imports: [
    CommonModule,

    // Material
    MatButtonModule,
    MatIconModule,
    OverlayWidgetModule
  ],
  exports: [TitleFilterComponent, FilterDirective]
})
export class TitleFilterModule {}
