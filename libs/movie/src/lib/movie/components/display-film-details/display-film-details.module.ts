import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { NgModule } from "@angular/core";
import { MovieDisplayFilmDetailsComponent } from "./display-film-details.component";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [CommonModule, FlexLayoutModule, TranslateSlugModule],
  declarations: [MovieDisplayFilmDetailsComponent],
  exports: [MovieDisplayFilmDetailsComponent]
})

export class MovieDisplayFilmDetailsModule {}
