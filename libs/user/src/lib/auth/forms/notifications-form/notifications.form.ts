import { FormControl, Validators } from '@angular/forms';
import { NotificationSettings, NotificationSettingsTemplate } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createNotificationSettingsControls(settings: Partial<NotificationSettingsTemplate> = {}, disabled = false) {
  return {
    email: new FormControl({ value: settings.email ?? true, disabled: false }, Validators.required),
    app: new FormControl({ value: settings.app ?? true, disabled }, Validators.required),
  }
}

type NotificationSettingsControl = ReturnType<typeof createNotificationSettingsControls>;

class NotificationSettingsForm extends FormEntity<NotificationSettingsControl> {
  constructor(data: NotificationSettingsTemplate, disabled = false) {
    super(createNotificationSettingsControls(data, disabled))
  }
}

function createNotificationsControls(settings: Partial<NotificationSettings> = {}) {
  return {
    eventIsAboutToStart: new NotificationSettingsForm(settings.eventIsAboutToStart),
    oneDayReminder: new NotificationSettingsForm(settings.oneDayReminder),
    orgMemberUpdated: new NotificationSettingsForm(settings.orgMemberUpdated),
    requestToAttendEventSent: new NotificationSettingsForm(settings.requestToAttendEventSent),
    requestFromUserToJoinOrgCreate: new NotificationSettingsForm(settings.requestFromUserToJoinOrgCreate, true),
    requestFromUserToJoinOrgDeclined: new NotificationSettingsForm(settings.requestFromUserToJoinOrgDeclined),
    invitationToAttendEventUpdated: new NotificationSettingsForm(settings.invitationToAttendEventUpdated),
    requestToAttendEventUpdated: new NotificationSettingsForm(settings.requestToAttendEventUpdated),
    screeningRequested: new NotificationSettingsForm(settings.screeningRequested),
    screeningRequestSent: new NotificationSettingsForm(settings.screeningRequestSent),
    movieAccepted: new NotificationSettingsForm(settings.movieAccepted),
    movieAskingPriceRequested: new NotificationSettingsForm(settings.movieAskingPriceRequested),
    movieAskingPriceRequestSent: new NotificationSettingsForm(settings.movieAskingPriceRequestSent),
    requestToAttendEventCreated: new NotificationSettingsForm(settings.requestToAttendEventCreated, true),
    invitationToAttendMeetingCreated: new NotificationSettingsForm(settings.invitationToAttendMeetingCreated, true),
    invitationToAttendScreeningCreated: new NotificationSettingsForm(settings.invitationToAttendScreeningCreated, true),
    offerCreatedConfirmation: new NotificationSettingsForm(settings.offerCreatedConfirmation),
    contractCreated: new NotificationSettingsForm(settings.contractCreated, true),
    createdCounterOffer: new NotificationSettingsForm(settings.createdCounterOffer),
    receivedCounterOffer: new NotificationSettingsForm(settings.receivedCounterOffer),
    myOrgAcceptedAContract: new NotificationSettingsForm(settings.myOrgAcceptedAContract),
    myContractWasAccepted: new NotificationSettingsForm(settings.myContractWasAccepted),
    myOrgDeclinedAContract: new NotificationSettingsForm(settings.myOrgDeclinedAContract),
    myContractWasDeclined: new NotificationSettingsForm(settings.myContractWasDeclined),
    underSignature: new NotificationSettingsForm(settings.underSignature, true),
  }
}

type NotificationsControl = ReturnType<typeof createNotificationsControls>;

export class NotificationsForm extends FormEntity<NotificationsControl, NotificationSettings> {
  constructor(data: Partial<NotificationSettings> = {}) {
    super(createNotificationsControls(data))
  }
}
