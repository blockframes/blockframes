// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { OverlayWidgetComponent } from '../overlay-widget/overlay-widget.component';

@Component({
  selector: 'bf-filter-button',
  templateUrl: './filter-button.component.html',
  styleUrls: ['./filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilterButtonComponent {
  @Input() widgetTarget: OverlayWidgetComponent;
  @Input() color: string;
}