import { NgModule } from '@angular/core';
import { ImageReferenceDirective } from './image-reference.directive';
import { BackgroundReferenceDirective } from './background-reference.directive';
import { ImgModule } from '../img/img.module';

@NgModule({
  declarations: [ImageReferenceDirective, BackgroundReferenceDirective],
  imports: [ImgModule],
  exports: [ImageReferenceDirective, BackgroundReferenceDirective, ImgModule]
})
export class ImageReferenceModule {}
