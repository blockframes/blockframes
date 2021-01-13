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
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';

// Pages
import { MarketplaceHomeComponent } from './home.component';
import { ImageUploaderModule } from '@blockframes/media/image/uploader/uploader.module';

// Pipes
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';

@NgModule({
  declarations: [MarketplaceHomeComponent],
  imports: [
    CommonModule,
    ImageUploaderModule,
    MatButtonModule,
    FlexLayoutModule,
    SliderModule,
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
