import { Component, ChangeDetectionStrategy, Pipe, PipeTransform, Inject } from '@angular/core';

// Blockframes
import { NotificationsForm } from './notifications.form';
import { App, notificationTypes, NotificationTypes } from '@blockframes/model';
import { AuthService } from '@blockframes/auth/service';

// Material
import { MatLegacySlideToggleChange as MatSlideToggleChange } from '@angular/material/legacy-slide-toggle';
import { MatLegacyCheckboxChange as MatCheckboxChange } from '@angular/material/legacy-checkbox';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { APP } from '@blockframes/utils/routes/utils';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';

interface NotificationSetting { text: string, tooltip: boolean };

const titleType: Partial<Record<NotificationTypes, NotificationSetting>> = {
  movieAccepted: { text: $localize`A title is successfully published on the marketplace.`, tooltip: false },
  movieSubmitted: { text: $localize`A title is successfully submitted to the Archipel Content team.`, tooltip: false },
  movieAskingPriceRequested: { text: $localize`A user requests the asking price for a title.`, tooltip: true },
  movieAskingPriceRequestSent: { text: $localize`Your request for the asking price has been sent.`, tooltip: false },
  requestFromUserToJoinOrgCreate: { text: $localize`A user requests to join your organization.`, tooltip: true },
  requestFromUserToJoinOrgDeclined: { text: $localize`A user\'s request to join your organization was declined. `, tooltip: false }, // TODO 8026
  orgMemberUpdated: { text: $localize`A user joins or leaves your organization.`, tooltip: false },
  requestToAttendEventSent: { text: $localize`Your request to join an event is successfully sent.`, tooltip: false },
  eventIsAboutToStart: { text: $localize`REMINDER - An event you\'re attending will start in 1 hour. (RECOMMENDED)`, tooltip: false },
  oneDayReminder: { text: $localize`REMINDER - An event you\'re attending will start in 24 hours. (RECOMMENDED)`, tooltip: false },
  invitationToAttendEventUpdated: { text: $localize`A user answers your invitation to an event you\'re organizing.`, tooltip: false },
  requestToAttendEventUpdated: { text: $localize`Your request to join an event gets accepted or declined.`, tooltip: false },
  requestToAttendEventCreated: { text: $localize`A user wants to join an event you\'re organizing. (RECOMMENDED)`, tooltip: true },
  invitationToAttendMeetingCreated: { text: $localize`You are invited to a meeting. (RECOMMENDED)`, tooltip: true },
  invitationToAttendScreeningCreated: { text: $localize`You are invited to a screening. (RECOMMENDED)`, tooltip: true },
  invitationToAttendSlateCreated: { text: $localize`You are invited to a slate presentation. (RECOMMENDED)`, tooltip: true },
  screeningRequested: { text: $localize`A screening has been requested. (RECOMMENDED)`, tooltip: true },
  screeningRequestSent: { text: $localize`Your screening request was successfully sent`, tooltip: false },
  screenerRequested: { text: $localize`A screener has been requested. (RECOMMENDED)`, tooltip: true },
  screenerRequestSent: { text: $localize`Your screener request was successfully sent`, tooltip: false },
  offerCreatedConfirmation: { text: $localize`Your offer is successfully sent`, tooltip: false },
  contractCreated: { text: $localize`An offer has been made on one of your titles. (RECOMMENDED)`, tooltip: true },
  createdCounterOffer: { text: $localize`Your counter-offer is submitted.`, tooltip: true },
  receivedCounterOffer: { text: $localize`You receive a counter offer. (RECOMMENDED)`, tooltip: true },
  myOrgAcceptedAContract: { text: $localize`You accept an offer. (RECOMMENDED)`, tooltip: true },
  myContractWasAccepted: { text: $localize`Your offer gets accepted. (RECOMMENDED)`, tooltip: true },
  myOrgDeclinedAContract: { text: $localize`You decline an offer. (RECOMMENDED)`, tooltip: true },
  myContractWasDeclined: { text: $localize`Your offer gets declined. (RECOMMENDED)`, tooltip: true },
  invitationToJoinWaterfallCreated: { text: $localize`You are invited to join a Waterfall. (RECOMMENDED)`, tooltip: true },
  invitationToJoinWaterfallUpdated: { text: $localize`A user answers your invitation to join your Waterfall.`, tooltip: false },
  userRequestedDocumentCertification: { text: $localize`A user requested a document certification.`, tooltip: false },
  requestForStatementReviewCreated: { text: $localize`Your request to review a statement is being processed.`, tooltip: false },
  requestForStatementReviewApproved: { text: $localize`Your statement has been approved.`, tooltip: false },
  requestForStatementReviewDeclined: { text: $localize`Your statement has been declined.`, tooltip: false },
  userRequestedStatementReview: { text: $localize`A user requested a statement review.`, tooltip: false },
  documentSharedWithOrg: { text: $localize`A document has been shared with your organization.`, tooltip: false },
  // #7946 this may be reactivated later
  // underSignature: { text: 'Your offer is now under signature or validated by all parties. (RECOMMENDED)', tooltip: true },
};

const tables: { title: string, types: NotificationTypes[], appAuthorized: App[] }[] = [
  {
    title: $localize`Company Management`,
    types: ['requestFromUserToJoinOrgCreate', 'orgMemberUpdated'],
    appAuthorized: ['catalog', 'festival', 'financiers', 'waterfall']
  },
  {
    title: $localize`Content Management`,
    types: [
      'movieAccepted',
      'movieSubmitted',
      'screenerRequested',
      'screenerRequestSent',
      'movieAskingPriceRequested',
      'movieAskingPriceRequestSent'
    ],
    appAuthorized: ['catalog']
  },
  {
    title: $localize`Content Management`,
    types: [
      'movieAccepted',
    ],
    appAuthorized: ['financiers']
  },
  {
    title: 'Content Management',
    types: [
      'movieAccepted',
      'movieAskingPriceRequested',
      'movieAskingPriceRequestSent'
    ],
    appAuthorized: ['festival']
  },
  {
    title: $localize`Event Management`,
    types: [
      'invitationToAttendScreeningCreated',
      'invitationToAttendSlateCreated',
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
    title: $localize`Offer Management`,
    types: [
      'offerCreatedConfirmation',
      'contractCreated',
      // #7946 this may be reactivated later
      // 'underSignature',
    ],
    appAuthorized: ['catalog']
  },
  {
    title: $localize`Negotiation Management`,
    types: [
      'myContractWasAccepted',
      'myOrgAcceptedAContract',
      'myOrgDeclinedAContract',
      'myContractWasDeclined',
      'createdCounterOffer',
      'receivedCounterOffer',
    ],
    appAuthorized: ['catalog']
  },
  {
    title: $localize`Waterfall Management`,
    types: [
      'invitationToJoinWaterfallCreated',
      'invitationToJoinWaterfallUpdated',
      'userRequestedDocumentCertification',
      'requestForStatementReviewCreated',
      'requestForStatementReviewApproved',
      'requestForStatementReviewDeclined',
      'userRequestedStatementReview',
      'documentSharedWithOrg'
    ],
    appAuthorized: ['waterfall']
  }
];

@Component({
  selector: '[form] auth-notifications-form',
  templateUrl: './notifications-form.component.html',
  styleUrls: ['./notifications-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsFormComponent {

  public types = notificationTypes;
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

  setAll(event: MatCheckboxChange, mode: 'email' | 'app', types: NotificationTypes[]) {
    const checked = event.checked;
    for (const type of types) {
      const castedType = type as any;
      const c = this.form.get(castedType).get(mode);
      if (!c.disabled) c.setValue(checked);
    }
  }

  public async update() {
    try {
      const notifications = this.form.getRawValue();
      const uid = this.authService.uid;
      const { settings } = this.authService.profile;
      settings.notifications = notifications;
      await this.authService.update({ uid, settings });
      this.snackBar.open($localize`Notification Settings updated. `, 'close', { duration: 4000 });
    } catch (err) {
      this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 5000 });
    }
  }
}

@Pipe({ name: 'someChecked' })
export class SomeCheckedPipe implements PipeTransform {
  transform(value: NotificationsForm['value'], mode: 'email' | 'app', types: NotificationTypes[]) {
    let checked = 0;
    for (const type of types) {
      if (value[type]?.[mode]) checked++;
    }
    return checked > 0 && checked < types.length;
  }
}

@Pipe({ name: 'everyChecked' })
export class EveryCheckedPipe implements PipeTransform {
  transform(value: NotificationsForm['value'], mode: 'email' | 'app', types: NotificationTypes[]) {
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
