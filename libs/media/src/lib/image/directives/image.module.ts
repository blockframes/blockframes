import { NgModule } from '@angular/core';
import { BackgroundDirective } from './background.directive';
import { ImageDirective } from './image.directive';

@NgModule({
  declarations: [BackgroundDirective, ImageDirective],
  exports: [BackgroundDirective, ImageDirective]
})
export class ImageModule {}
