import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './banner.component';
import { ImageReferenceModule } from '@blockframes/ui/media';



@NgModule({
  declarations: [BannerComponent],
  exports: [BannerComponent],
  imports: [
    CommonModule,
    ImageReferenceModule,
  ]
})
export class MovieBannerModule { }
