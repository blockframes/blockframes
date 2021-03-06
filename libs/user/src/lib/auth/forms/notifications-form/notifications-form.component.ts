import { Component, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
// Blockframes
import { NotificationsForm } from './notifications.form';
import { App, getCurrentApp } from "@blockframes/utils/apps";
import { NotificationTypesBase, notificationTypesBase } from '@blockframes/notification/types';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

interface NotificationSetting { text: string, tooltip: boolean };
const titleType: Record<NotificationTypesBase, NotificationSetting> = {
  movieAccepted: { text: 'A title is succesfully published on the marketplace.', tooltip: false },
  requestFromUserToJoinOrgCreate: { text: 'A user requests to join your organization.', tooltip: true },
  requestFromUserToJoinOrgDeclined: { text: 'A user\'s request to join your organization was declined. ', tooltip: false },
  orgMemberUpdated: { text: 'A user joins or leaves your organization.', tooltip: false },
  requestToAttendEventSent: { text: 'Your request to join an event is successfully sent.', tooltip: false },
  eventIsAboutToStart: { text: 'REMINDER - An event you\'re attending will start in 1 hour. (RECOMMENDED)', tooltip: false },
  oneDayReminder: { text: 'REMINDER - An event you\'re attending will start in 24 hours. (RECOMMENDED)', tooltip: false },
  invitationToAttendEventUpdated: { text: 'A user answers your invitation to an event you\'re organizing.', tooltip: false },
  requestToAttendEventUpdated: { text: 'Your request to join an event gets accepted or declined.', tooltip: false },
  requestToAttendEventCreated: { text: 'A user wants to join an event you\'re organizing. (RECOMMENDED)', tooltip: true },
  invitationToAttendMeetingCreated: { text: 'You are invited to a meeting. (RECOMMENDED)', tooltip: true },
  invitationToAttendScreeningCreated: { text: 'You are invited to a screening. (RECOMMENDED)', tooltip: true },
  offerCreatedConfirmation: { text: 'You send an offer', tooltip: false }
};

const tables: { title: string, types: string[], appAuthorized: App[] }[] = [
  {
    title: 'Company Management',
    types: ['requestFromUserToJoinOrgCreate', 'orgMemberUpdated', 'requestFromUserToJoinOrgDeclined'],
    appAuthorized: ['catalog', 'festival', 'financiers']
  },
  {
    title: 'Content Management',
    types: ['movieAccepted'],
    appAuthorized: ['catalog', 'festival', 'financiers']
  },
  {
    title: 'Event Management',
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
  {
    title: 'Offer Management',
    types: ['offerCreatedConfirmation'],
    appAuthorized: ['catalog']
  }
];

@Component({
  selector: '[form] auth-notifications-form',
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
      if (!c.disabled) c.setValue(checked);
    }
  }

  setAll(event: MatCheckboxChange, mode: 'email' | 'app', types: NotificationTypesBase[]) {
    const checked = event.checked;
    for (const type of types) {
      const c = this.form.get(type).get(mode);
      if (!c.disabled) c.setValue(checked);
    }
  }

  public async update() {
    const notifications = this.form.getRawValue();
    const uid = this.authQuery.userId;
    await this.authService.update({ uid, settings: { notifications } });

    this.snackBar.open('Notifications settings updated.', 'close', { duration: 2000 });
  }
}

@Pipe({ name: 'someChecked' })
export class SomeCheckedPipe implements PipeTransform {
  transform(value: NotificationsForm['value'], mode: 'email' | 'app', types: NotificationTypesBase[]) {
    let checked = 0;
    for (const type of types) {
      if (value[type]?.[mode]) checked++;
    }
    return checked > 0 && checked < types.length;
  }
}

@Pipe({ name: 'everyChecked' })
export class EveryCheckedPipe implements PipeTransform {
  transform(value: NotificationsForm['value'], mode: 'email' | 'app', types: NotificationTypesBase[]) {
    return types.every(type => !!value[type]?.[mode] || value[type]?.[mode] === undefined);
  }
}

@Pipe({ name: 'showNotification' })
export class ShowNotificationPipe implements PipeTransform {
  currentApp = getCurrentApp(this.routerQuery);
  public tables = tables;
  constructor(private routerQuery: RouterQuery) { }

  transform(index: number) {
    return this.tables[index].appAuthorized.includes(this.currentApp);
  }
}
