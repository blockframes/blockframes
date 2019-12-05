import { NgModule } from '@angular/core';
import { BackgroundImageDirective } from './background-image.directive';

@NgModule({
  declarations: [BackgroundImageDirective],
  exports: [BackgroundImageDirective]
})
export class BackgroundImageModule {}
