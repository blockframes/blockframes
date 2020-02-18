import { NgModule } from '@angular/core';
import { ImageReferenceDirective } from './image-reference.directive';

@NgModule({
  declarations: [ImageReferenceDirective],
  exports: [ImageReferenceDirective]
})
export class ImageReferenceModule {}
