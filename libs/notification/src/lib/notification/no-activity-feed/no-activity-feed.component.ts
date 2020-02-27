import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'notification-empty',
  templateUrl: './no-activity-feed.component.html',
  styleUrls: ['./no-activity-feed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoActivityFeedComponent {
}
