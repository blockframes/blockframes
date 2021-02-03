import { FormControl, Validators } from '@angular/forms';
import { NotificationSettings, NotificationSettingsTemplate } from '@blockframes/user/+state/user.model';
import { EntityControl, FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createNotificationSettingsTemplateControls(settings: Partial<NotificationSettingsTemplate>): EntityControl<NotificationSettingsTemplate> {
  return {
    email: new FormControl(![null, undefined].includes(settings?.email) ? settings?.email : true, Validators.required),
    app: new FormControl(![null, undefined].includes(settings?.app) ? settings?.app : true, Validators.required),
  }
}

type NotificationSettingsControl = ReturnType<typeof createNotificationSettingsTemplateControls>;

class NotificationSettingsForm extends FormEntity<NotificationSettingsControl> {
  constructor(data?: NotificationSettingsTemplate) {
    super(createNotificationSettingsTemplateControls(data))
  }
}

function createNotificationsControls(settings: Partial<NotificationSettings>): EntityControl<NotificationSettings> {
  return {
    eventIsAboutToStart: new NotificationSettingsForm(settings?.eventIsAboutToStart),
    oneDayReminder: new NotificationSettingsForm(settings?.oneDayReminder),
    orgMemberUpdated: new NotificationSettingsForm(settings?.orgMemberUpdated),
    requestToAttendEventSent: new NotificationSettingsForm(settings?.requestToAttendEventSent),
    requestFromUserToJoinOrgCreate: new NotificationSettingsForm(settings?.requestFromUserToJoinOrgCreate),
    invitationToAttendEventUpdated: new NotificationSettingsForm(settings?.invitationToAttendEventUpdated),
    requestToAttendEventUpdated: new NotificationSettingsForm(settings?.requestToAttendEventUpdated),
    movieSubmitted: new NotificationSettingsForm(settings?.movieSubmitted),
    movieAccepted: new NotificationSettingsForm(settings?.movieAccepted),
    // @TODO #4046 add other notificationsType
  }
}

type NotificationsControl = ReturnType<typeof createNotificationsControls>;

export class NotificationsForm extends FormEntity<NotificationsControl> {
  constructor(data?: NotificationSettings) {
    super(createNotificationsControls(data))
  }
}
