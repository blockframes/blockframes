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
        email: true,
        app: true
      },
      subNotification: [
        {
          notificationType: 'requestFromUserToJoinOrgCreate',
          subtitle: 'A new user requests to join your organization.',
          email: true,
          app: true
        },
        {
          notificationType: 'memberAddedToOrg',
          subtitle: 'A new member joins your organization.',
          email: true,
          app: true
        }
      ]
    },
    // {
    //   title: 'Content Management Notifications',
    //   available: ['catalog', 'festival', 'financiers'],
    //   completed: {
    //     email: true,
    //     app: true
    //   },
    //   subNotification: [
    //     {
    //       notificationType: '',
    //       subtitle: 'A title is successfully submitted for validation.',
    //       email: true,
    //       app: true
    //     },
    //     {
    //       notificationType: '',
    //       subtitle: 'A title gets published to the marketplace.',
    //       email: true,
    //       app: true
    //     }
    //   ]
    // },
    {
      // ! IT IS ONLY FOR FESTIVAL
      title: 'Event Management Notifications',
      available: ['festival'],
      completed: {
        email: true,
        app: true
      },
      subNotification: [
        // {
        //   notificationType: '',
        //   subtitle: 'An organization invites you to a screening.',
        //   email: true,
        //   app: true
        // },
        // {
        //   notificationType: '',
        //   subtitle: 'An user invites you to a meeting.',
        //   email: true,
        //   app: true
        // },
        // {
        //   notificationType: '',
        //   subtitle: 'An user answers your invitation to an event.',
        //   email: true,
        //   app: true
        // },
        // {
        //   notificationType: '',
        //   subtitle: 'An user requests an access to an event you organize.',
        //   email: true,
        //   app: true
        // },
        // {
        //   notificationType: '',
        //   subtitle: 'Your request to access an event has been sent.',
        //   email: true,
        //   app: true
        // },
        // {
        //   notificationType: '',
        //   subtitle: 'An organization answers your request to access an event.',
        //   email: true,
        //   app: true
        // },
        {
          notificationType: 'oneDayReminder',
          subtitle: 'Reminder 24h before an event starts.',
          email: true,
          app: true
        },
        {
          notificationType: 'eventIsAboutToStart',
          subtitle: 'Reminder 1h before an event starts.',
          email: true,
          app: true
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

  toogleAll(event: MatSlideToggleChange) {
    this.notifications.forEach(notification => {
      notification.completed[event.source.name] = event.checked;
      notification.subNotification.forEach(subNotif => {
        subNotif[event.source.name] = event.checked;
        this.form.controls[subNotif.notificationType].controls[event.source.name].setValue(event.checked);
      })
    });
  }

  // CHECKBOX LOGIC //
  someComplete(index: number, value: string) {
    if (this.notifications[index].subNotification == null) return false;
    return this.notifications[index].subNotification.filter(sn => sn[value]).length > 0 && !this.notifications[index].completed[value];
  }

  updateAllComplete(index: number, subIndex: number, event: MatCheckboxChange) {
    this.notifications[index].subNotification[subIndex][event.source.name] = event.checked;
    this.notifications[index].completed[event.source.name] = this.notifications[index].subNotification !== null && this.notifications[index].subNotification.every(sub => sub[event.source.name]);
  }

  setAll(completed: boolean, index: number, value: string) {
    this.notifications[index].completed[value] = completed;
    if (this.notifications[index].subNotification == null) return;
    this.notifications[index].subNotification.forEach(sn => {
      sn[value] = completed;
      this.form.controls[sn.notificationType].controls[value].setValue(completed);
    });
  }
}
