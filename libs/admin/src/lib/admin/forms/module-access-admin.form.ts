import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { ModuleAccess, createModuleAccess } from '@blockframes/utils/apps';

function createModuleAccessAdminControls(entity: Partial<ModuleAccess>) {
  const moduleAccess = createModuleAccess(entity);
  return {
    marketplace: new FormControl(moduleAccess.marketplace),
    dashboard: new FormControl(moduleAccess.dashboard),
  };
}

type ModuleAccessAdminControl = ReturnType<typeof createModuleAccessAdminControls>;

export class ModuleAccessAdminForm extends FormEntity<ModuleAccessAdminControl> {
  constructor(data?: ModuleAccess) {
    super(createModuleAccessAdminControls(data));
  }
}
