import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
// Blockframes
import { NotificationsForm } from './notifications.form';
import { NotificationSettings } from '@blockframes/user/+state/user.model';
import { getCurrentApp } from "@blockframes/utils/apps";

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { NotificationType } from '@blockframes/notification/types';

@Component({
  selector: '[form] user-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormComponent {
  public notifications = [
    {
      title: 'Company Management Notifications',
      available: ['catalog', 'festival', 'financiers'],
      completed: {
        email: false,
        app: false
      },
      subNotification: [
        {
          subtitle: 'A new user requests to join your organization.',
          email: false,
          app: true
        },
        {
          subtitle: 'A new member joins your organization.',
          email: false,
          app: false
        }
      ]
    },
    {
      title: 'Content Management Notifications',
      available: ['catalog', 'festival', 'financiers'],
      completed: {
        email: false,
        app: false
      },
      subNotification: [
        {
          subtitle: 'A title is successfully submitted for validation.',
          email: false,
          app: false
        },
        {
          subtitle: 'A title gets published to the marketplace.',
          email: false,
          app: false
        }
      ]
    },
    {
      // ! IT IS ONLY FOR FESTIVAL
      title: 'Event Management Notifications',
      available: ['festival'],
      completed: {
        email: false,
        app: false
      },
      subNotification: [
        {
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
        }
      ]
    }
  ];

  @Input() form: NotificationsForm;
  currentApp: string = getCurrentApp(this.routerQuery);

  constructor(private routerQuery: RouterQuery) { }

  showNotifications(index: number) {
    return this.notifications[index].available.includes(this.currentApp);
  }

  toogle(notificationType: NotificationType, event: MatSlideToggleChange) {
    this.form.get(notificationType).get(event.source.name as keyof NotificationSettings).setValue(event.checked);
  }

  // CHECKBOX LOGIC //
  someComplete(index: number, value: string) {
    if (this.notifications[index].subNotification == null) return false;
    return this.notifications[index].subNotification.filter(sn => sn[value]).length > 0 && !this.notifications[index].completed[value];
  }

  updateAllComplete(index: number, subIndex: number, event: MatCheckboxChange, value: string) {
    this.notifications[index].subNotification[subIndex][value] = event.checked;
    this.notifications[index].completed[value] = this.notifications[index].subNotification !== null && this.notifications[index].subNotification.every(sub => sub[value]);
  }

  setAll(completed: boolean, index: number, value: string) {
    this.notifications[index].completed[value] = completed;
    if (this.notifications[index].subNotification == null) return;
    this.notifications[index].subNotification.forEach(sn => sn[value] = completed);
  }
}
