import { FormStaticValue } from '@blockframes/utils/form';
import { FormControl } from '@angular/forms';
import { Price } from '@blockframes/utils/common-interfaces/price';
import { FormEntity } from '@blockframes/utils';

function createContractVersionPriceControls(price: Partial<Price>){
    return {
        amount: new FormControl(price.amount),
        currency: new FormStaticValue(price.currency, 'MOVIE_CURRENCIES')
    }
}

export type ContractVersionPriceControl = ReturnType<typeof createContractVersionPriceControls>;

export class ContractVersionPriceForm extends FormEntity<ContractVersionPriceControl, Price> {
  constructor(price: Partial<Price> = {}) {
    super(createContractVersionPriceControls(price));
  }
}
