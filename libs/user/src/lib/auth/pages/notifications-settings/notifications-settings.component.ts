import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'user-notifications-settings',
  templateUrl: 'notifications-settings.component.html',
  styleUrls: ['notifications-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationSettingsComponent {

  constructor() {
  }
}
