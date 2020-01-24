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
import { MatButtonModule, MatIconModule } from '@angular/material';

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
    MatIconModule
  ],
  exports: [RightListComponent]
})
export class RightListModule {}
