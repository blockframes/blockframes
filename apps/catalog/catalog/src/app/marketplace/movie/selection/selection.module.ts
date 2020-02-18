import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MarketplaceSelectionComponent } from './selection.component';

import { MovieBannerModule } from '@blockframes/movie/movie/components/banner/banner.module';
import { RightListModule } from '@blockframes/movie/distribution-deals/components/right-list/right-list.module';
import { WishlistButtonModule } from '../../components/wishlist-button/wishlist-button.module';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [MarketplaceSelectionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    MovieBannerModule,
    RightListModule,
    WishlistButtonModule,

    // Material
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,

    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceSelectionComponent
      }
    ])
  ]
})
export class SelectionModule {}
