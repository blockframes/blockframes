import { NgModule } from '@angular/core';
import { ImageReferenceDirective } from './image-reference.directive';
import { BackgroundReferenceDirective } from './background-reference.directive';

@NgModule({
  declarations: [ImageReferenceDirective, BackgroundReferenceDirective],
  exports: [ImageReferenceDirective, BackgroundReferenceDirective]
})
export class ImageReferenceModule {}
