// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

// Libraries
import { SliderModule } from '@blockframes/ui/slider/slider.module';
import { WishlistButtonModule } from '@blockframes/organization/components/wishlist-button/wishlist-button.module';
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { OrganizationBannerModule } from '@blockframes/organization/components/banner/banner.module';
import { MovieSlideModule } from '@blockframes/movie/components/slide/slide.module'
import { OrganizationCardMinimalModule } from '@blockframes/organization/components/card-minimal/card-minimal.module'
import { PreferenceModule } from '@blockframes/auth/pages/preferences/modal/preferences.module';

// Pages
import { MarketplaceHomeComponent } from './home.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Pipes
import { GetLinkModule, CMSPipeModule, SortByPipeModule } from '@blockframes/utils/pipes';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';

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
    GetOrgPipeModule,
    GetLinkModule,
    MatLayoutModule,
    WishlistButtonModule,
    OrganizationCardMinimalModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    SortByPipeModule,
    PreferenceModule,
    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceHomeComponent
      }
    ])
  ]
})
export class MarketplaceHomeModule { }
