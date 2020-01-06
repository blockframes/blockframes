import { NgModule } from '@angular/core';
import { OverlayWidgetDirective } from './overlay-widget.directive';
import { OverlayModule } from '@angular/cdk/overlay';
import { OverlayWidgetComponent } from './overlay-widget.component';
@NgModule({
  imports: [OverlayModule],
  declarations: [OverlayWidgetDirective, OverlayWidgetComponent],
  exports: [OverlayWidgetDirective, OverlayWidgetComponent]
})

export class OverlayWidgetModule {}
