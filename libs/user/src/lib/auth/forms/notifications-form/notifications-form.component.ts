import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
// Blockframes
import { NotificationsForm } from './notifications.form';
import { NotificationSettings } from '@blockframes/user/+state/user.model';

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { NotificationType } from '@blockframes/notification/types';

@Component({
  selector: '[form] user-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormComponent {

  @Input() form: NotificationsForm;

  toogle(notificationType: NotificationType, event: MatSlideToggleChange) {
    this.form.get(notificationType).get(event.source.name as keyof NotificationSettings).setValue(event.checked);
    this.form.markAsTouched();
  }

}
