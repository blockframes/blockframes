// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCarouselModule } from '@ngmodule/material-carousel';

// Pages
import { MarketplaceHomeComponent } from './home.component';
import {CropperModule} from '@blockframes/ui/cropper/cropper.module'

@NgModule({
  declarations: [MarketplaceHomeComponent],
  imports: [
    CommonModule,
    CropperModule,
    MatButtonModule,
    FlexLayoutModule,
    MatCarouselModule,
    RouterModule.forChild([
      {
        path: '',
        component: MarketplaceHomeComponent
      }
    ])
  ]
})
export class MarketplaceHomeModule {}
