import { FormControl, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { PrivateConfig, createPrivateConfig } from '@blockframes/utils/common-interfaces/utility';

function createPrivateConfigControls(entity: Partial<PrivateConfig>) {
  const config = createPrivateConfig(entity);
  return {
    url: new FormControl(config.url, [Validators.required]),
  };
}

type PrivateConfigControl = ReturnType<typeof createPrivateConfigControls>;

export class PrivateConfigForm extends FormEntity<PrivateConfigControl> {
  constructor(data?: PrivateConfig) {
    super(createPrivateConfigControls(data));
  }
}
