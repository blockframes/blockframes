import { NgModule } from '@angular/core';
import { BackgroundReferenceDirective } from './background-reference.directive';
import { ImgModule } from '../img/img.module';

@NgModule({
  declarations: [BackgroundReferenceDirective],
  imports: [ImgModule],
  exports: [ImgModule, BackgroundReferenceDirective]
})
export class ImageReferenceModule {}
