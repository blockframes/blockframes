// Angular
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Blockframes
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.pipe';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { DurationModule }from '@blockframes/utils/pipes/duration.pipe'
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Components
import { WishlistComponent } from './wishlist.component';

@NgModule({
  declarations: [WishlistComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Blockframes
    TranslateSlugModule,
    ImageReferenceModule,
    DurationModule,
    ToLabelModule,

    // Material
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatRippleModule,
    MatSnackBarModule,

    RouterModule.forChild([
      {
        path: '',
        component: WishlistComponent
      }
    ])
  ]
})
export class WishlistModule {}
