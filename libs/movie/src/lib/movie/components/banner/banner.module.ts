import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent, BannerActionsDirective } from './banner.component';
import { ImageReferenceModule } from '@blockframes/ui/media';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';



@NgModule({
  declarations: [BannerComponent, BannerActionsDirective],
  exports: [BannerComponent, BannerActionsDirective],
  imports: [
    CommonModule,
    ImageReferenceModule,
    TranslateSlugModule,
  ]
})
export class MovieBannerModule { }
