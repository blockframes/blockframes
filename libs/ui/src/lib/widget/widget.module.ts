import { NgModule } from '@angular/core';
import { WidgetDirective } from './widget.directive';
import { OverlayModule } from '@angular/cdk/overlay';
import { WidgetComponent } from './widget.component';
@NgModule({
  imports: [OverlayModule],
  declarations: [WidgetDirective, WidgetComponent],
  exports: [WidgetDirective, WidgetComponent]
})

export class WidgetModule {}
