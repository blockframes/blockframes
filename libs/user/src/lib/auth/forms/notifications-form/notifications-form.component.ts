import { Component, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
// Blockframes
import { NotificationsForm } from './notifications.form';
import { getCurrentApp } from "@blockframes/utils/apps";
import { NotificationTypesBase, notificationTypesBase } from '@blockframes/notification/types';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';


const titleType: Record<NotificationTypesBase, string> = {
  movieSubmitted: 'A title is successfully submitted for validation.',
  movieAccepted: 'A title gets published to the marketplace.',
  requestFromUserToJoinOrgCreate: 'A new user requests to join your organization.',
  invitationFromUserToJoinOrgDecline: 'An user declined your invitation to join your organization.',
  orgMemberUpdated: 'A new member joins your organization.',
  requestToAttendEventSent: 'Your request to access an event has been sent.',
  eventIsAboutToStart: 'Reminder 1h before an event starts.',
  oneDayReminder: 'Reminder 24h before an event starts.',
  invitationToAttendEventUpdated: 'An users answers your invitation to an event.',
  requestToAttendEventUpdated: 'Organizer of the event has answered your request.',
  requestToAttendEventCreated: 'An user requests an access to an event your organize.',
  invitationToAttendMeetingCreated: 'An user invites you to a meeting.',
  invitationToAttendScreeningCreated: 'An organization invites you to a screening.',
};

const tables = [
  {
    title: 'Company Management Notifications',
    types: ['requestFromUserToJoinOrgCreate', 'orgMemberUpdated', 'invitationFromUserToJoinOrgDecline'],
    appAuthorized: ['catalog', 'festival', 'financiers']
  },
  {
    title: 'Content Management Notifications',
    types: ['movieSubmitted', 'movieAccepted'],
    appAuthorized: ['catalog', 'festival', 'financiers']
  },
  {
    title: 'Event Management Notifications',
    types: [
      'invitationToAttendScreeningCreated',
      'invitationToAttendMeetingCreated',
      'invitationToAttendEventUpdated',
      'requestToAttendEventCreated',
      'requestToAttendEventSent',
      'requestToAttendEventUpdated',
      'oneDayReminder',
      'eventIsAboutToStart',
    ],
    appAuthorized: ['festival']
  },
];

@Component({
  selector: '[form] user-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormComponent {

  public types = [...notificationTypesBase];
  public titleType = titleType;
  public tables = tables;

  public form = new NotificationsForm(this.authQuery.user.settings?.notifications);

  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private snackBar: MatSnackBar
    ) { }

  toogleAll(event: MatSlideToggleChange, mode: 'email' | 'app') {
    const checked = event.checked;
    for (const control of Object.values(this.form.controls)) {
      const c = control.get(mode);
      if(!c.disabled) c.setValue(checked);
    }
  }

  setAll(event: MatCheckboxChange, mode: 'email' | 'app', types: NotificationTypesBase[]) {
    const checked = event.checked;
    for (const type of types) {
      const c = this.form.get(type as any).get(mode);
      if(!c.disabled) c.setValue(checked);
    }
  }

  public async update() {
    const notifications = this.form.getRawValue();
    const uid = this.authQuery.userId;
    await this.authService.update({ uid, settings: { notifications } });

    this.snackBar.open('Notifications settings updated.', 'close', { duration: 2000 });
  }
}

@Pipe({name: 'someChecked'})
export class SomeCheckedPipe implements PipeTransform {
  transform(value: NotificationsForm['value'], mode: 'email' | 'app', types: NotificationTypesBase[]) {
    let checked = 0;
    for (const type of types) {
      if (value[type]?.[mode]) checked ++;
    }
    return checked > 0 && checked < types.length;
  }
}

@Pipe({name: 'everyChecked'})
export class EveryCheckedPipe implements PipeTransform {
  transform(value: NotificationsForm['value'], mode: 'email' | 'app', types: NotificationTypesBase[]) {
    return types.every(type => !!value[type]?.[mode]);
  }
}

@Pipe({name: 'showNotification'})
export class ShowNotificationPipe implements PipeTransform {
  currentApp: string = getCurrentApp(this.routerQuery);
  public tables = tables;
  constructor(private routerQuery: RouterQuery) {}

  transform(index: number) {
    return this.tables[index].appAuthorized.includes(this.currentApp);
  }
}
