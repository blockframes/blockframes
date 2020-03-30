import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ViewComponent, MovieBannerActions, MovieBannerAside } from './view.component';

import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { DisplayNameModule, TranslateSlugModule } from '@blockframes/utils/pipes';
import { AppNavModule } from '@blockframes/ui/app-nav';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';



@NgModule({
  declarations: [ViewComponent, MovieBannerActions, MovieBannerAside],
  exports: [ViewComponent, MovieBannerActions, MovieBannerAside],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageReferenceModule,
    DisplayNameModule,
    TranslateSlugModule,
    AppNavModule,
    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ]
})
export class MovieViewLayoutModule { }
