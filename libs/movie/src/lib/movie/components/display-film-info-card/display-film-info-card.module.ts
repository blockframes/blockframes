import { NgModule } from '@angular/core';
import { MovieDisplayFilmInfoCardComponent } from './display-film-info-card.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { ImageReferenceModule } from '@blockframes/ui/image-reference/image-reference.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    TranslateSlugModule,
    MatChipsModule,
    ImageReferenceModule,
  ],
  declarations: [MovieDisplayFilmInfoCardComponent],
  exports: [MovieDisplayFilmInfoCardComponent]
})
export class MovieDisplayFilmInfoCardModule {}
