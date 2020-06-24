import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent, BannerActionsDirective } from './banner.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';

export const imports = [
  CommonModule,
  ImageReferenceModule,
  TranslateSlugModule,
];

@NgModule({
  declarations: [BannerComponent, BannerActionsDirective],
  exports: [BannerComponent, BannerActionsDirective],
  imports
})
export class MovieBannerModule { }
