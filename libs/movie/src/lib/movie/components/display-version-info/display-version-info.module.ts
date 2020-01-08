import { NgModule } from '@angular/core';
import { MovieDisplayVersionInfoComponent } from './display-version-info.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, TranslateSlugModule],
  declarations: [MovieDisplayVersionInfoComponent],
  exports: [MovieDisplayVersionInfoComponent]
})
export class MovieDisplayVersionInfoModule {}
