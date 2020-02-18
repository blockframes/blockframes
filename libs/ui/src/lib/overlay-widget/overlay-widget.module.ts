import { NgModule } from '@angular/core';
import { OverlayWidgetButtonDirective, OverlayWidgetInputDirective, OverlayWidgetTooltipDirective } from './overlay-widget.directive';
import { OverlayModule } from '@angular/cdk/overlay';
import { OverlayWidgetComponent, WidgetHeaderDirective, WidgetCardDirective, WidgetFooterDirective } from './overlay-widget.component';

const components = [
  OverlayWidgetButtonDirective,
  OverlayWidgetInputDirective,
  OverlayWidgetTooltipDirective,
  OverlayWidgetComponent,
  WidgetHeaderDirective,
  WidgetCardDirective,
  WidgetFooterDirective
]

@NgModule({
  imports: [OverlayModule],
  declarations: components,
  exports: components
})

export class OverlayWidgetModule {}
