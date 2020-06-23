// Angular
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Blockframes
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { ImgModule } from '@blockframes/ui/media/img/img.module';
import { DurationModule }from '@blockframes/utils/pipes/duration.pipe'

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Components
import { WishlistViewComponent } from './wishlist-view/wishlist-view.component';
import { WishlistCurrentRepertoryComponent } from './wishlist-current-repertory/wishlist-current-repertory.component';

@NgModule({
  declarations: [WishlistViewComponent, WishlistCurrentRepertoryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Blockframes
    TranslateSlugModule,
    ImgModule,
    DurationModule,
    
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
