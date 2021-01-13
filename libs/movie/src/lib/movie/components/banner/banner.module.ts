import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent, BannerActionsDirective } from './banner.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

export const imports = [
  CommonModule,
  ImageModule,
  ToLabelModule
];

@NgModule({
  declarations: [BannerComponent, BannerActionsDirective],
  exports: [BannerComponent, BannerActionsDirective],
  imports
})
export class MovieBannerModule { }
