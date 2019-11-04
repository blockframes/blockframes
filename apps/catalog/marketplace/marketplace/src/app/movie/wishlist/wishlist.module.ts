import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WishlistViewComponent } from './wishlist-view/wishlist-view.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatSortModule, MatIconModule, MatRippleModule } from '@angular/material';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

// Components
import { WishlistCurrentRepertoryComponent } from './wishlist-current-repertory/wishlist-current-repertory.component';


@NgModule({
  declarations: [WishlistViewComponent, WishlistCurrentRepertoryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Material
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatRippleModule,

    RouterModule.forChild([
      {
        path: '',
        component: WishlistViewComponent
      }
    ])
  ]
})
export class WishlistModule {}
