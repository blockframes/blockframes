
import { FormControl } from '@angular/forms';

import { FormEntity } from '@blockframes/utils/form';
import { ContractStatus } from '@blockframes/contract/contract/+state/contract.model';

export interface CRMContractView {
  status: ContractStatus,
  price: number,
}

export function createCRMContractViewControl(status: ContractStatus = 'pending', price = 0) {
  return {
    status: new FormControl(status),
    price: new FormControl(price),
  };
}

type CRMContractViewControl = ReturnType<typeof createCRMContractViewControl>;

export class CRMContractViewForm extends FormEntity<CRMContractViewControl, CRMContractView> {
  constructor(status?: ContractStatus, price?: number) {
    super(createCRMContractViewControl(status, price));
  }
}
