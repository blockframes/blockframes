import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgModule } from '@blockframes/ui/media/img/img.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';

import { MarketplaceMovieMainComponent } from './main.component';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [MarketplaceMovieMainComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TranslateSlugModule,
    ImgModule,
    // Material
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    RouterModule.forChild([{ path: '', component: MarketplaceMovieMainComponent }])
  ]
})
export class MarketplaceMovieMainModule { }
