import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card.component';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.module';

export const imports = [
  CommonModule,
  ImageReferenceModule,
  TranslateSlugModule,
  DisplayNameModule
];

@NgModule({
  declarations: [CardComponent],
  exports: [CardComponent],
  imports
})
export class MovieCardModule { }
