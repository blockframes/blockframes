import { FormControl, Validators } from '@angular/forms';
import { UserNotificationsSettings } from '@blockframes/user/+state/user.model';
import { EntityControl, FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createNotificationsSettings(params?: Partial<UserNotificationsSettings>): UserNotificationsSettings {
  return {
    allEmail: true,
    allInApp: true,
    ...params,
  }
}

function createNotificationsControls(entity: Partial<UserNotificationsSettings>): EntityControl<UserNotificationsSettings> {
  const settings = createNotificationsSettings(entity);
  return {
    allEmail: new FormControl(settings.allEmail, Validators.required),
    allInApp: new FormControl(settings.allInApp, Validators.required),
  }
}

type NotificationsControl = ReturnType<typeof createNotificationsControls>;

export class NotificationsForm extends FormEntity<NotificationsControl> {
  constructor(data?: UserNotificationsSettings) {
    super(createNotificationsControls(data))
  }
}
