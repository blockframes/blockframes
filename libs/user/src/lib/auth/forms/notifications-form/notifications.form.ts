import { UntypedFormControl, Validators } from '@angular/forms';
import { NotificationSettings, NotificationSettingsTemplate } from '@blockframes/model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createNotificationSettingsControls(settings: Partial<NotificationSettingsTemplate> = {}, disabled = false) {
  return {
    email: new UntypedFormControl({ value: settings.email ?? true, disabled: false }, Validators.required),
    app: new UntypedFormControl({ value: settings.app ?? true, disabled }, Validators.required),
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
    screeningRequested: new NotificationSettingsForm(settings.screeningRequested, true),
    screeningRequestSent: new NotificationSettingsForm(settings.screeningRequestSent),
    screenerRequested: new NotificationSettingsForm(settings.screeningRequested, true),
    screenerRequestSent: new NotificationSettingsForm(settings.screeningRequestSent),
    movieAccepted: new NotificationSettingsForm(settings.movieAccepted),
    movieSubmitted: new NotificationSettingsForm(settings.movieSubmitted),
    movieAskingPriceRequested: new NotificationSettingsForm(settings.movieAskingPriceRequested, true),
    movieAskingPriceRequestSent: new NotificationSettingsForm(settings.movieAskingPriceRequestSent),
    requestToAttendEventCreated: new NotificationSettingsForm(settings.requestToAttendEventCreated, true),
    invitationToAttendMeetingCreated: new NotificationSettingsForm(settings.invitationToAttendMeetingCreated, true),
    invitationToAttendScreeningCreated: new NotificationSettingsForm(settings.invitationToAttendScreeningCreated, true),
    invitationToAttendSlateCreated: new NotificationSettingsForm(settings.invitationToAttendSlateCreated, true),
    offerCreatedConfirmation: new NotificationSettingsForm(settings.offerCreatedConfirmation),
    contractCreated: new NotificationSettingsForm(settings.contractCreated, true),
    createdCounterOffer: new NotificationSettingsForm(settings.createdCounterOffer, true),
    receivedCounterOffer: new NotificationSettingsForm(settings.receivedCounterOffer, true),
    myOrgAcceptedAContract: new NotificationSettingsForm(settings.myOrgAcceptedAContract, true),
    myContractWasAccepted: new NotificationSettingsForm(settings.myContractWasAccepted, true),
    myOrgDeclinedAContract: new NotificationSettingsForm(settings.myOrgDeclinedAContract, true),
    myContractWasDeclined: new NotificationSettingsForm(settings.myContractWasDeclined, true),
    invitationToJoinWaterfallCreated: new NotificationSettingsForm(settings.invitationToJoinWaterfallCreated, true),
    invitationToJoinWaterfallUpdated: new NotificationSettingsForm(settings.invitationToJoinWaterfallUpdated),
    userRequestedDocumentCertification: new NotificationSettingsForm(settings.userRequestedDocumentCertification),
    requestForStatementReviewCreated: new NotificationSettingsForm(settings.requestForStatementReviewCreated),
    requestForStatementReviewApproved: new NotificationSettingsForm(settings.requestForStatementReviewApproved),
    requestForStatementReviewDeclined: new NotificationSettingsForm(settings.requestForStatementReviewDeclined),
    userRequestedStatementReview: new NotificationSettingsForm(settings.userRequestedStatementReview),
    documentSharedWithOrg: new NotificationSettingsForm(settings.documentSharedWithOrg),
    // #7946 this may be reactivated later
    // underSignature: new NotificationSettingsForm(settings.underSignature, true),
  }
}

type NotificationsControl = ReturnType<typeof createNotificationsControls>;

export class NotificationsForm extends FormEntity<NotificationsControl, NotificationSettings> {
  constructor(data: Partial<NotificationSettings> = {}) {
    super(createNotificationsControls(data))
  }
}
