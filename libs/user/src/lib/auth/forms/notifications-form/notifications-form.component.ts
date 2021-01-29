import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
// Blockframes
import { NotificationsForm } from './notifications.form';
import { NotificationSettings } from '@blockframes/user/+state/user.model';
import { getCurrentApp } from "@blockframes/utils/apps";

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: '[form] user-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormComponent {
  public notifications = [{
    title: 'Company Management Notifications',
    subNotification: [{
      subtitle: 'A new user requests to join your organization.',
      email: false,
      app: true
    },
    {
      subtitle: 'A new member joins your organization.',
      email: false,
      app: false
    }]
  },
  {
    title: 'Content Management Notifications',
    subNotification: [{
      subtitle: 'A title is successfully submitted for validation.',
      email: false,
      app: false
    },
    {
      subtitle: 'A title gets published to the marketplace.',
      email: false,
      app: false
    }]
  },
  {
    title: 'Event Management Notifications',
    subNotification: [{
      subtitle: 'An organization invites you to a screening.',
      email: false,
      app: false
    },
    {
      subtitle: 'An user invites you to a meeting.',
      email: false,
      app: false
    },
    {
      subtitle: 'An user answers your invitation to an event.',
      email: false,
      app: false
    },
    {
      subtitle: 'An user requests an access to an event you organize.',
      email: false,
      app: false
    },
    {
      subtitle: 'Your request to access an event has been sent.',
      email: false,
      app: false
    },
    {
      subtitle: 'An organization answers your request to access an event.',
      email: false,
      app: false
    },
    {
      subtitle: 'Reminder 24h before an event starts.',
      email: false,
      app: false
    },
    {
      subtitle: 'Reminder 1h before an event starts.',
      email: false,
      app: false
    }]
  }];

  @Input() form: NotificationsForm;
  selectAllEmail = false;
  selectAllApp = false;
  currentApp: string = getCurrentApp(this.routerQuery);

  constructor(private routerQuery: RouterQuery) { }

  toogleDefault(event: MatSlideToggleChange) {
    this.form.get('default').get(event.source.name as keyof NotificationSettings).setValue(event.checked);
  }

  selectAll(event: MatSlideToggleChange) {
    if (event.source.name === 'selectAllEmail') this.selectAllEmail = event.checked;
    if (event.source.name === 'selectAllApp') this.selectAllApp = event.checked;
  }

  someComplete(): boolean {
    if (this.notifications.subNotification == null) {
      return false;
    }
    return this.notifications.subNotification.filter(n => n.email.value).length > 0;
  }

}
