// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';
import { SliderModule } from '@blockframes/ui/slider/slider.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';

// Pages
import { MarketplaceHomeComponent } from './home.component';
import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';

// Pipes
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.module';

@NgModule({
  declarations: [MarketplaceHomeComponent],
  imports: [
    CommonModule,
    CropperModule,
    MatButtonModule,
    FlexLayoutModule,
    SliderModule,
    TranslateSlugModule,
    DisplayNameModule,
    WishlistButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceHomeComponent
      }
    ])
  ]
})
export class MarketplaceHomeModule { }
