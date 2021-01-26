import { FormControl, Validators } from '@angular/forms';
import { createNotificationSettings, NotificationSettings, NotificationSettingsTemplate } from '@blockframes/user/+state/user.model';
import { EntityControl, FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createNotificationSettingsTemplateControls(settings: Partial<NotificationSettingsTemplate>): EntityControl<NotificationSettingsTemplate> {
  return {
    email: new FormControl(settings.email, Validators.required),
    app: new FormControl(settings.app, Validators.required),
  }
}

type NotificationSettingsControl = ReturnType<typeof createNotificationSettingsTemplateControls>;

class NotificationSettingsForm extends FormEntity<NotificationSettingsControl> {
  constructor(data?: NotificationSettingsTemplate) {
    super(createNotificationSettingsTemplateControls(data))
  }
}

function createNotificationsControls(entity: Partial<NotificationSettings>): EntityControl<NotificationSettings> {
  const settings = createNotificationSettings(entity);
  return {
    default: new NotificationSettingsForm(settings.default),
    // @TODO #4046 add other notificationsType
  }
}

type NotificationsControl = ReturnType<typeof createNotificationsControls>;

export class NotificationsForm extends FormEntity<NotificationsControl> {
  constructor(data?: NotificationSettings) {
    super(createNotificationsControls(data))
  }
}
