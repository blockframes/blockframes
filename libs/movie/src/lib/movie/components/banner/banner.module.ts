import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent, BannerActionsDirective } from './banner.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

export const imports = [
  CommonModule,
  ImageReferenceModule,
  ToLabelModule
];

@NgModule({
  declarations: [BannerComponent, BannerActionsDirective],
  exports: [BannerComponent, BannerActionsDirective],
  imports
})
export class MovieBannerModule { }
