import { NgModule } from '@angular/core';
import { BackgroundReferenceDirective } from './background-reference.directive';
import { ImgModule } from '@blockframes/media/components/img/img.module';

@NgModule({
  declarations: [BackgroundReferenceDirective],
  imports: [ImgModule],
  exports: [ImgModule, BackgroundReferenceDirective]
})
export class ImageReferenceModule {}
