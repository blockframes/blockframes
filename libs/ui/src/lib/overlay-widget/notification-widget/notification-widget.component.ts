import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'overlay-notification-widget',
  templateUrl: './notification-widget.component.html',
  styleUrls: ['./notification-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NotificationWidgetComponent {
}
