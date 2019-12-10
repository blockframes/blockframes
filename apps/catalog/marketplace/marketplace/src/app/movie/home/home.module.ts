// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';

// Pages
import { MarketplaceHomeComponent } from './home.component';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module'

@NgModule({
  declarations: [MarketplaceHomeComponent],
  imports: [
    CommonModule,
    CropperModule,
    MatButtonModule,
    FlexLayoutModule,
    MatCarouselModule,
    TranslateSlugModule,
    MatIconModule,
    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceHomeComponent
      }
    ])
  ]
})
export class MarketplaceHomeModule {}
