import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WishlistViewComponent } from './wishlist-view/wishlist-view.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material';

// Components
import { WishlistCurrentRepertoryComponent } from './wishlist-current-repertory/wishlist-current-repertory.component';

@NgModule({
  declarations: [WishlistViewComponent, WishlistCurrentRepertoryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TranslateSlugModule,
    ImageReferenceModule,
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
        component: WishlistViewComponent
      }
    ])
  ]
})
export class WishlistModule {}
