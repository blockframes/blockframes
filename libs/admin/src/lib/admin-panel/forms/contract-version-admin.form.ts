import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { ContractVersion, createContractVersion } from '@blockframes/contract/version/+state/contract-version.model';

function createContractVersionAdminControls(entity: Partial<ContractVersion>) {
  const contract = createContractVersion(entity);
  return {
    status: new FormControl(contract.status),
  };
}

type ContractVersionAdminControl = ReturnType<typeof createContractVersionAdminControls>;

export class ContractVersionAdminForm extends FormEntity<ContractVersionAdminControl> {
  constructor(data?: ContractVersion) {
    super(createContractVersionAdminControls(data));
  }
}
