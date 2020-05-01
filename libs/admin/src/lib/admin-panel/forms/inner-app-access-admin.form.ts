import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { InnerAppAccess, createInnerAppAccess } from '@blockframes/utils/apps';

function createInnerAppAccessAdminControls(entity: Partial<InnerAppAccess>) {
  const innerAppAccess = createInnerAppAccess(entity);
  return {
    marketplace: new FormControl(innerAppAccess.marketplace),
    dashboard: new FormControl(innerAppAccess.dashboard),
  };
}

type InnerAppAccessAdminControl = ReturnType<typeof createInnerAppAccessAdminControls>;

export class InnerAppAdminForm extends FormEntity<InnerAppAccessAdminControl> {
  constructor(data?: InnerAppAccess) {
    super(createInnerAppAccessAdminControls(data));
  }
}
