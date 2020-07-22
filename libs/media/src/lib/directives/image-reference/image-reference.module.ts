import { NgModule } from '@angular/core';
import { BackgroundReferenceDirective } from './background-reference.directive';
import { ImgModule } from '@blockframes/media/components/img/img.module';
import { ImageReferenceDirective } from './image-reference.directive';

@NgModule({
  declarations: [BackgroundReferenceDirective, ImageReferenceDirective],
  imports: [ImgModule],
  exports: [ImgModule, BackgroundReferenceDirective, ImageReferenceDirective]
})
export class ImageReferenceModule {}
