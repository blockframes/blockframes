import { FormControl, Validators } from '@angular/forms';
import { NotificationSettings, NotificationSettingsTemplate } from '@blockframes/user/+state/user.model';
import { EntityControl, FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createNotificationSettingsTemplateControls(settings: Partial<NotificationSettingsTemplate>): EntityControl<NotificationSettingsTemplate> {
  return {
    email: new FormControl(settings?.email !== null ? settings?.email : true, Validators.required),
    app: new FormControl(settings?.app !== null ? settings?.app : true, Validators.required),
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
    memberAddedToOrg: new NotificationSettingsForm(settings?.memberAddedToOrg),
    memberRemovedFromOrg: new NotificationSettingsForm(settings?.memberRemovedFromOrg),
    requestFromUserToJoinOrgCreate: new NotificationSettingsForm(settings?.requestFromUserToJoinOrgCreate),
    // @TODO #4046 add other notificationsType
  }
}

type NotificationsControl = ReturnType<typeof createNotificationsControls>;

export class NotificationsForm extends FormEntity<NotificationsControl> {
  constructor(data?: NotificationSettings) {
    super(createNotificationsControls(data))
  }
}
