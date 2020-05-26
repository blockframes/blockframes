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
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';
import { SliderModule } from '@blockframes/ui/slider/slider.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';

// Pages
import { HomeComponent } from './home.component';

// Pipes
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    CropperModule,
    MatButtonModule,
    FlexLayoutModule,
    SliderModule,
    DisplayNameModule,
    TranslateSlugModule,
    WishlistButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ]
})
export class HomeModule {}
