import { Component, ChangeDetectionStrategy, Pipe, PipeTransform, Inject } from '@angular/core';

// Blockframes
import { NotificationsForm } from './notifications.form';
import { App } from "@blockframes/utils/apps";
import { NotificationTypesBase, notificationTypesBase } from '@blockframes/model';
import { AuthService } from '@blockframes/auth/+state';

// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APP } from '@blockframes/utils/routes/utils';

interface NotificationSetting { text: string, tooltip: boolean };
const titleType: Record<NotificationTypesBase, NotificationSetting> = {
  movieAccepted: { text: 'A title is successfully published on the marketplace.', tooltip: false },
  movieAskingPriceRequested: { text: `A user requests the asking price for a title.`, tooltip: false },
  movieAskingPriceRequestSent: { text: `Your request for the asking price has been sent.`, tooltip: false },
  requestFromUserToJoinOrgCreate: { text: 'A user requests to join your organization.', tooltip: true },
  requestFromUserToJoinOrgDeclined: { text: 'A user\'s request to join your organization was declined. ', tooltip: false }, // TODO 8026
  orgMemberUpdated: { text: 'A user joins or leaves your organization.', tooltip: false },
  requestToAttendEventSent: { text: 'Your request to join an event is successfully sent.', tooltip: false },
  eventIsAboutToStart: { text: 'REMINDER - An event you\'re attending will start in 1 hour. (RECOMMENDED)', tooltip: false },
  oneDayReminder: { text: 'REMINDER - An event you\'re attending will start in 24 hours. (RECOMMENDED)', tooltip: false },
  invitationToAttendEventUpdated: { text: 'A user answers your invitation to an event you\'re organizing.', tooltip: false },
  requestToAttendEventUpdated: { text: 'Your request to join an event gets accepted or declined.', tooltip: false },
  requestToAttendEventCreated: { text: 'A user wants to join an event you\'re organizing. (RECOMMENDED)', tooltip: true },
  invitationToAttendMeetingCreated: { text: 'You are invited to a meeting. (RECOMMENDED)', tooltip: true },
  invitationToAttendScreeningCreated: { text: 'You are invited to a screening. (RECOMMENDED)', tooltip: true },
  screeningRequested: { text: 'A screening has been requested. (RECOMMENDED)', tooltip: false },
  screeningRequestSent: { text: 'Your screening request was successfully sent', tooltip: false },
  offerCreatedConfirmation: { text: 'Your offer is successfully sent', tooltip: false },
  contractCreated: { text: 'An offer has been made on one of your titles. (RECOMMENDED)', tooltip: true },
  createdCounterOffer: { text: 'You\'ve created a counter offer.', tooltip: true },
  receivedCounterOffer: { text: 'You\'ve received a counter offer. (RECOMMENDED)', tooltip: true },
  myOrgAcceptedAContract: { text: 'You accepted a counter offer. (RECOMMENDED)', tooltip: true },
  myContractWasAccepted: { text: 'Your counter offer was accepted. (RECOMMENDED)', tooltip: true },
  myOrgDeclinedAContract: { text: 'You declined a counter offer. (RECOMMENDED)', tooltip: true },
  myContractWasDeclined: { text: 'Your counter offer was declined. (RECOMMENDED)', tooltip: true },
  // #7946 this may be reactivated later
  // underSignature: { text: 'Your offer is now under signature. (RECOMMENDED)', tooltip: true },
};

const tables: { title: string, types: string[], appAuthorized: App[] }[] = [
  {
    title: 'Company Management',
    types: ['requestFromUserToJoinOrgCreate', 'orgMemberUpdated'],
    appAuthorized: ['catalog', 'festival', 'financiers']
  },
  {
    title: 'Content Management',
    types: [
      'movieAccepted',
      'movieAskingPriceRequested',
      'movieAskingPriceRequestSent'
    ],
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
      'screeningRequested',
      'screeningRequestSent'
    ],
    appAuthorized: ['festival']
  },
  {
    title: 'Offer Management',
    types: [
      'offerCreatedConfirmation',
      'contractCreated',
      // #7946 this may be reactivated later
      // 'underSignature',
    ],
    appAuthorized: ['catalog']
  },
  {
    title: 'Negotiation Management',
    types: [
      'myContractWasAccepted',
      'myOrgAcceptedAContract',
      'myOrgDeclinedAContract',
      'myContractWasDeclined',
      'createdCounterOffer',
      'receivedCounterOffer',
    ],
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

  public form = new NotificationsForm(this.authService.profile.settings?.notifications);

  constructor(
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
    const uid = this.authService.uid;
    await this.authService.update({ uid, settings: { notifications } });

    this.snackBar.open('Notification Settings updated.', 'close', { duration: 4000 });
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
  constructor(@Inject(APP) private app: App) { }

  transform(index: number) {
    return tables[index].appAuthorized.includes(this.app);
  }
}
