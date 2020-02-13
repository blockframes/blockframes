import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { Contract, createContract } from '@blockframes/contract/contract/+state/contract.model';

function createContractAdminControls(entity: Partial<Contract>) {
  const contract = createContract(entity);
  return {
    type: new FormControl(contract.type),
  };
}

type ContractAdminControl = ReturnType<typeof createContractAdminControls>;

export class ContractAdminForm extends FormEntity<ContractAdminControl> {
  constructor(data?: Contract) {
    super(createContractAdminControls(data));
  }
}
