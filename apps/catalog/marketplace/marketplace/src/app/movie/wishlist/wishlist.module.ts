import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WishlistViewComponent } from './wishlist-view/wishlist-view.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

// Custom modules
import { WishlistCurrentRepertoryComponent } from './wishlist-current-repertory/wishlist-current-repertory.component';
import { MatTableModule, MatSortModule } from '@angular/material';

@NgModule({
  declarations: [WishlistViewComponent, WishlistCurrentRepertoryComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    // Material
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,

    RouterModule.forChild([
      {
        path: '',
        component: WishlistViewComponent
      }
    ])
  ]
})
export class WishlistModule {}
