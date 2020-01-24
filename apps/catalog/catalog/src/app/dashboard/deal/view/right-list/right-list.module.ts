import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RightListComponent } from './right-list.component';
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget/overlay-widget.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [RightListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayWidgetModule,
    TranslateSlugModule,
    FlexLayoutModule,

    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  exports: [RightListComponent]
})
export class RightListModule {}
