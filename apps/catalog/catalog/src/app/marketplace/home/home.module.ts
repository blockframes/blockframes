// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Libraries
import { SliderModule } from '@blockframes/ui/slider/slider.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { OrganizationBannerModule} from '@blockframes/organization/components/banner/banner.module';
import { MovieSlideModule } from '@blockframes/movie/components/slide/slide.module'
import { OrganizationCardMinimalModule} from '@blockframes/organization/components/card-minimal/card-minimal.module'
import { SortByPipeModule } from '@blockframes/utils/pipes/sort-array.pipe';

// Pages
import { MarketplaceHomeComponent } from './home.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Pipes
import { GetLinkModule, CMSPipeModule } from '@blockframes/utils/pipes';

@NgModule({
  declarations: [MarketplaceHomeComponent],
  imports: [
    CommonModule,
    ImageModule,
    FlexLayoutModule,
    MovieSlideModule,
    SliderModule,
    CarouselModule,
    OrganizationBannerModule,
    MovieCardModule,
    CMSPipeModule,
    GetLinkModule,
    MatLayoutModule,
    WishlistButtonModule,
    OrganizationCardMinimalModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    SortByPipeModule,
    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceHomeComponent
      }
    ])
  ]
})
export class MarketplaceHomeModule { }
