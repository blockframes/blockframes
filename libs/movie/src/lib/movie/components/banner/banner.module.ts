import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent, BannerActionsDirective } from './banner.component';
import { ImageReferenceModule } from '@blockframes/ui/media';



@NgModule({
  declarations: [BannerComponent, BannerActionsDirective],
  exports: [BannerComponent, BannerActionsDirective],
  imports: [
    CommonModule,
    ImageReferenceModule,
  ]
})
export class MovieBannerModule { }
