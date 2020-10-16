import { FormStaticValue } from '@blockframes/utils/form';
import { FormControl, Validators } from '@angular/forms';
import { Price, createPrice } from '@blockframes/utils/common-interfaces/price';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createPriceControls(price: Partial<Price>) {
  const entity = createPrice(price)
  return {
    amount: new FormControl(entity.amount, [Validators.min(0)]),
    currency: new FormStaticValue(entity.currency, 'movieCurrencies'),
    commission: new FormControl(entity.commission, Validators.max(100)),
    commissionBase: new FormControl(entity.commissionBase),
    vat: new FormControl(entity.vat),
  }
}

export type PriceControl = ReturnType<typeof createPriceControls>;

export class PriceForm extends FormEntity<PriceControl, Price> {
  constructor(price: Partial<Price> = {}) {
    super(createPriceControls(price));
  }
}
