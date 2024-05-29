import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ListFilterComponent, FilterDirective } from './list-filter.component';
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget/overlay-widget.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [ListFilterComponent, FilterDirective],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Material
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    OverlayWidgetModule,
    MatRippleModule
  ],
  exports: [ListFilterComponent, FilterDirective]
})
export class ListFilterModule {}
