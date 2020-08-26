import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TitleFilterComponent, FilterDirective } from './title-filter.component';

// Material
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget/overlay-widget.module';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [TitleFilterComponent, FilterDirective],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Material
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    OverlayWidgetModule
  ],
  exports: [TitleFilterComponent, FilterDirective]
})
export class TitleFilterModule {}
