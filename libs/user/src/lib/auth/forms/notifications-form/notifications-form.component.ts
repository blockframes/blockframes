import { Component, ChangeDetectionStrategy, Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
// Blockframes
import { NotificationsForm } from './notifications.form';
import { getCurrentApp } from "@blockframes/utils/apps";
import { NotificationType, notificationTypes } from '@blockframes/notification/types';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

//  TODO Type Record<NotificationType, string>
const titleType = {
  requestFromUserToJoinOrgCreate: 'A new user requests to join your organization.',
  orgMemberUpdated: 'A new member joins your organization.',
  invitationFromUserToJoinOrgDecline: 'An user declined your invitation to join your organization.',
  movieSubmitted: 'A title is successfully submitted for validation.',
  movieAccepted: 'A title gets published to the marketplace.',
  invitationToAttendEventUpdated: 'An users answers your invitation to an event.',
  requestToAttendEventCreated: 'An user requests an access to an event your organize.',
  requestToAttendEventSent: 'Your request to access an event has been sent.',
  oneDayReminder: 'Reminder 24h before an event starts.',
  eventIsAboutToStart: 'Reminder 1h before an event starts.',
  invitationToAttendScreeningCreated: 'An organization invites you to a screening.',
  invitationToAttendMeetingCreated: 'An user invites you to a meeting.',
  requestToAttendEventUpdated: 'Organizer of the event has answered your request.'
};

@Component({
  selector: '[form] user-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormComponent {

  public types = [...notificationTypes];
  public titleType = titleType;
  public tables = [
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
        'invitationToAttendEventUpdated',
        // 'requestToAttendEventCreated',
        'requestToAttendEventUpdated',
        'requestToAttendEventSent',
        'oneDayReminder',
        'eventIsAboutToStart',
        // 'invitationToAttendScreeningCreated',
        // 'invitationToAttendMeetingCreated'
      ],
      appAuthorized: ['festival']
    },
  ];

  currentApp: string = getCurrentApp(this.routerQuery);
  public form = new NotificationsForm(this.authQuery.user.settings?.notifications);

  constructor(
    private routerQuery: RouterQuery,
    private authQuery: AuthQuery,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
    ) { }

  showNotification(index: number) {
    return this.tables[index].appAuthorized.includes(this.currentApp);
  }

  toogleAll(event: MatSlideToggleChange, mode: 'email' | 'app') {
    const checked = event.checked;
    for (const control of Object.values(this.form.controls)) {
      const c = control.get(mode);
      if(!c.disabled) c.setValue(checked);
    }
  }

  setAll(event: MatCheckboxChange, mode: 'email' | 'app', types: NotificationType[]) {
    const checked = event.checked;
    for (const type of types) {
      const c = this.form.get(type as any).get(mode);
      if(!c.disabled) c.setValue(checked);
    }
    this.cdr.markForCheck();
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
  transform(value: NotificationsForm['value'], mode: 'email' | 'app', types: NotificationType[]) {
    let checked = 0;
    for (const type of types) {
      if (value[type]?.[mode]) checked ++;
    }
    return checked > 0 && checked < types.length;
  }
}

@Pipe({name: 'everyChecked'})
export class EveryCheckedPipe implements PipeTransform {
  transform(value: NotificationsForm['value'], mode: 'email' | 'app', types: NotificationType[]) {
    return types.every(type => !!value[type]?.[mode]);
  }
}
