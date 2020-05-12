// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { CarouselComponent } from './carousel.component';

// Blockframes
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';
import { MovieTitleFeaturesModule } from '@blockframes/movie/components/title-features/title-features.module';

@NgModule({
  imports: [
    CommonModule,
    MovieCardModule,
    WishlistButtonModule,
    MovieTitleFeaturesModule
  ],
  exports: [CarouselComponent],
  declarations: [CarouselComponent]
})
export class CarouselModule { }
