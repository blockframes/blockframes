import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { ModuleAccess, createModuleAccess } from '@blockframes/model';

function createModuleAccessCrmControls(entity: Partial<ModuleAccess>) {
  const moduleAccess = createModuleAccess(entity);
  return {
    marketplace: new FormControl(moduleAccess.marketplace),
    dashboard: new FormControl(moduleAccess.dashboard),
  };
}

type ModuleAccessCrmControl = ReturnType<typeof createModuleAccessCrmControls>;

export class ModuleAccessCrmForm extends FormEntity<ModuleAccessCrmControl> {
  constructor(data?: ModuleAccess) {
    super(createModuleAccessCrmControls(data));
  }
}
