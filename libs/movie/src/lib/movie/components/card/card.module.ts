import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { WishlistButtonModule } from "@blockframes/organization/components/wishlist-button/wishlist-button.module";
import { FlexLayoutModule } from '@angular/flex-layout';

// Pipes
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { MovieFeatureModule } from '../../pipes/movie-feature.pipe';
import { MovieImageModule } from './movie-image.pipe';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [CardComponent],
  exports: [CardComponent],
  imports: [
    CommonModule,
    RouterModule,
    ImageModule,
    DisplayNameModule,
    WishlistButtonModule,
    MovieFeatureModule,
    MovieImageModule,
    MatButtonModule,
    FlexLayoutModule,
    MatRippleModule
  ]
})
export class MovieCardModule { }
