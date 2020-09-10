// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ViewComponent, MovieHeader } from './view.component';

// Blockframes
import { AppBarModule } from '@blockframes/ui/app-bar';
import { DisplayNameModule, TranslateSlugModule } from '@blockframes/utils/pipes';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { UpcomingScreeningsModule } from '@blockframes/movie/components/upcoming-screenings/upcoming-screenings.module';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { CarouselModule } from '@blockframes/ui/carousel/carousel.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';



@NgModule({
  declarations: [ViewComponent, MovieHeader],
  exports: [ViewComponent, MovieHeader],

  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageReferenceModule,
    DisplayNameModule,
    TranslateSlugModule,
    AppBarModule,
    UpcomingScreeningsModule,
    MovieCardModule,
    CarouselModule,
    MatLayoutModule,
    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ]
})
export class MovieViewLayoutModule { }
