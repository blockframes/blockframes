import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
// Blockframes
import { NotificationsForm } from './notifications.form';
import { getCurrentApp } from "@blockframes/utils/apps";

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: '[form] user-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormComponent {
  public notificationGroup = [
    {
      title: 'Company Management Notifications',
      available: ['catalog', 'festival', 'financiers'],
      completed: {
        email: true,
        app: true
      },
      notification: [
        {
          notificationType: 'requestFromUserToJoinOrgCreate',
          subtitle: 'A new user requests to join your organization.',
          email: true,
          app: true,
          appMandatory: true
        },
        {
          notificationType: 'orgMemberUpdated',
          subtitle: 'A new member joins your organization.',
          email: true,
          app: true,
          appMandatory: false
        },
        {
          notificationType: 'invitationFromUserToJoinOrgDecline',
          subtitle: 'An user declined your invitation to join your organization.',
          email: true,
          app: true,
          appMandatory: false
        }
      ]
    },
    {
      title: 'Content Management Notifications',
      available: ['catalog', 'festival', 'financiers'],
      completed: {
        email: true,
        app: true
      },
      notification: [
        {
          notificationType: 'movieSubmitted',
          subtitle: 'A title is successfully submitted for validation.',
          email: true,
          app: true,
          appMandatory: false
        },
        {
          notificationType: 'movieAccepted',
          subtitle: 'A title gets published to the marketplace.',
          email: true,
          app: true,
          appMandatory: false
        }
      ]
    },
    {
      // ! IT IS ONLY FOR FESTIVAL
      title: 'Event Management Notifications',
      available: ['festival'],
      completed: {
        email: true,
        app: true
      },
      notification: [
        {
          notificationType: 'invitationToAttendScreeningCreated',
          subtitle: 'An organization invites you to a screening',
          email: true,
          app: true,
          appMandatory: true
        },
        {
          notificationType: 'invitationToAttendMeetingCreated',
          subtitle: 'An user invites you to a meeting',
          email: true,
          app: true,
          appMandatory: true
        },
        {
          notificationType: 'invitationToAttendEventUpdated',
          subtitle: 'An users answers your invitation to an event.',
          email: true,
          app: true,
          appMandatory: false
        },
        {
          notificationType: 'requestToAttendEventCreated',
          subtitle: 'An user requests an access to an event your organize',
          email: true,
          app: true,
          appMandatory: true
        },
        {
          notificationType: 'requestToAttendEventSent',
          subtitle: 'Your request to access an event has been sent.',
          email: true,
          app: true,
          appMandatory: false
        },
        {
          notificationType: 'requestToAttendEventUpdated',
          subtitle: 'Organizer of the event has answered your request.',
          email: true,
          app: true,
          appMandatory: false
        },
        {
          notificationType: 'oneDayReminder',
          subtitle: 'Reminder 24h before an event starts.',
          email: true,
          app: true,
          appMandatory: false
        },
        {
          notificationType: 'eventIsAboutToStart',
          subtitle: 'Reminder 1h before an event starts.',
          email: true,
          app: true,
          appMandatory: false
        }
      ]
    }
  ];

  @Input() form: NotificationsForm;
  currentApp: string = getCurrentApp(this.routerQuery);

  constructor(private routerQuery: RouterQuery) { }

  showNotifications(index: number) {
    return this.notificationGroup[index].available.includes(this.currentApp);
  }

  toogleAll(event: MatSlideToggleChange) {
    this.notificationGroup.forEach(group => {
      group.completed[event.source.name] = event.checked;
      group.notification.forEach(notif => {
        notif[event.source.name] = event.checked;
        this.form.controls[notif.notificationType].controls[event.source.name].setValue(event.checked);
      })
    });
  }

  // CHECKBOX LOGIC //
  someComplete(index: number, value: string) {
    if (this.notificationGroup[index].notification == null) return false;
    return this.notificationGroup[index].notification.filter(notif => notif[value]).length > 0 && !this.notificationGroup[index].completed[value];
  }

  updateAllComplete(index: number, subIndex: number, event: MatCheckboxChange) {
    this.notificationGroup[index].notification[subIndex][event.source.name] = event.checked;
    this.notificationGroup[index].completed[event.source.name] = this.notificationGroup[index].notification !== null && this.notificationGroup[index].notification.every(sub => sub[event.source.name]);
  }

  setAll(completed: boolean, index: number, value: string) {
    this.notificationGroup[index].completed[value] = completed;
    if (this.notificationGroup[index].notification == null) return;
    this.notificationGroup[index].notification.forEach(notif => {
      notif[value] = completed;
      this.form.controls[notif.notificationType].controls[value].setValue(completed);
    });
  }
}
