import { FormControl, Validators } from '@angular/forms';
import { createDistributionRight, DistributionRight } from '@blockframes/distribution-rights/+state/distribution-right.model';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';


function createRightAdminControls(entity: Partial<DistributionRight>) {
  const right = createDistributionRight(entity);
  return {
    status: new FormControl(right.status),
    contractId: new FormControl(right.contractId, [
      Validators.required
    ]),
    exclusive: new FormControl(right.exclusive),
  };
}

type RightAdminControl = ReturnType<typeof createRightAdminControls>;

export class RightAdminForm extends FormEntity<RightAdminControl> {
  constructor(data?: DistributionRight) {
    super(createRightAdminControls(data));
  }
}
