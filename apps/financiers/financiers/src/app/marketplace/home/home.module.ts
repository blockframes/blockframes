// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';
import { SliderModule } from '@blockframes/ui/slider/slider.module';
import { MovieSlideModule } from '@blockframes/movie/components/slide/slide.module'
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { OrganizationCardMinimalModule } from '@blockframes/organization/components/card-minimal/card-minimal.module';
import { OrganizationBannerModule } from '@blockframes/organization/components/banner/banner.module';
import { CampaignPipeModule } from '@blockframes/campaign/pipes';
// Page
import { HomeComponent } from './home.component';


@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: HomeComponent }]),
    FlexLayoutModule,

    // Blockframes
    SliderModule,
    CarouselModule,
    MovieCardModule,
    MovieSlideModule,
    WishlistButtonModule,
    OrganizationCardMinimalModule,
    OrganizationBannerModule,
    CampaignPipeModule,
    ImageModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule
  ]
})
export class HomeModule { }
