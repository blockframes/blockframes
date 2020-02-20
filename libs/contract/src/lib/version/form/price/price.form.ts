import { FormStaticValue } from '@blockframes/utils/form';
import { FormControl, Validators } from '@angular/forms';
import { Price, createPrice } from '@blockframes/utils/common-interfaces/price';
import { FormEntity } from '@blockframes/utils';

function createContractVersionPriceControls(price: Partial<Price>) {
  const entity = createPrice(price)
  return {
    amount: new FormControl(entity.amount, [Validators.required, Validators.min(1)]),
    currency: new FormStaticValue(entity.currency, 'MOVIE_CURRENCIES'),
    commission: new FormControl(entity.commission, Validators.max(100)),
    commissionBase: new FormControl(entity.commissionBase),
    vat: new FormControl(entity.vat),
  }
}

export type ContractVersionPriceControl = ReturnType<typeof createContractVersionPriceControls>;

export class ContractVersionPriceForm extends FormEntity<ContractVersionPriceControl, Price> {
  constructor(price: Partial<Price> = {}) {
    super(createContractVersionPriceControls(price));
  }
}
