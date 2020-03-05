import { FormControl, Validators } from '@angular/forms';
import { FormEntity } from '@blockframes/utils';
import { ContractTitleDetail, createContractTitleDetail } from '@blockframes/contract/contract/+state';


function createTitleDetailAdminControls(entity: Partial<ContractTitleDetail>) {
  const titleDetails = createContractTitleDetail(entity);
  return {
    titleId: new FormControl(titleDetails.titleId, [
      Validators.required
    ]),
    amount: new FormControl(titleDetails.price.amount, [
      Validators.required
    ]),
    currency: new FormControl(titleDetails.price.currency)
  };
}

type TitleDetailAdminControl = ReturnType<typeof createTitleDetailAdminControls>;

export class TitleDetailAdminForm extends FormEntity<TitleDetailAdminControl> {
  constructor(data?: ContractTitleDetail) {
    super(createTitleDetailAdminControls(data));
  }
}
