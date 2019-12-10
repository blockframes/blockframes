import { NgModule } from '@angular/core';
import { WidgetDirective } from './overlay.directive';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  imports: [OverlayModule],
  declarations: [WidgetDirective],
  exports: [WidgetDirective]
})

export class OverlayWidgetModule {}
