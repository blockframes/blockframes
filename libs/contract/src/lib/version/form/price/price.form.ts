import { FormStaticValue } from '@blockframes/utils/form';
import { FormControl, Validators } from '@angular/forms';
import { Price } from '@blockframes/utils/common-interfaces/price';
import { FormEntity } from '@blockframes/utils';

function createContractVersionPriceControls(price: Partial<Price>) {
  return {
    amount: new FormControl(price.amount, [Validators.required, Validators.min(1)]),
    currency: new FormStaticValue(price.currency, 'MOVIE_CURRENCIES'),
    commission: new FormControl(price.commission, Validators.max(100)),
    commissionBase: new FormControl(price.commissionBase),
    vat: new FormControl(price.vat),
  }
}

export type ContractVersionPriceControl = ReturnType<typeof createContractVersionPriceControls>;

export class ContractVersionPriceForm extends FormEntity<ContractVersionPriceControl, Price> {
  constructor(price: Partial<Price> = {}) {
    super(createContractVersionPriceControls(price));
  }
}
