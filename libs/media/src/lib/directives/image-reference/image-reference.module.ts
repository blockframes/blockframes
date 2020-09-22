import { NgModule } from '@angular/core';
import { BackgroundReferenceDirective } from './background-reference.directive';
import { ImageReferenceDirective } from './image-reference.directive';

@NgModule({
  declarations: [BackgroundReferenceDirective, ImageReferenceDirective],
  exports: [BackgroundReferenceDirective, ImageReferenceDirective]
})
export class ImageReferenceModule {}
