import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, OverlayModule],
  declarations: components,
  exports: components
})

export class OverlayWidgetModule {}
