import { NgModule, Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { getCurrencySymbol, formatCurrency } from '@angular/common';
import { Funding } from '../+state';

export function getTotalFundings(fundings: Funding[]) {
  return fundings.reduce((sum, funding) => sum + funding.amount, 0)
}

@Pipe({ name: 'totalFundings' })
export class TotalFundingsPipe implements PipeTransform {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
  ) {}

  transform(fundings: Funding[], currency: string) {
    const total = getTotalFundings(fundings);
    const currencySymbol = getCurrencySymbol(currency, 'narrow');

    if(total === 0) return 'N/C';
    return formatCurrency(total, this.locale, currencySymbol, 'symbol', '1.0-0');
  }
}

@NgModule({
  declarations: [TotalFundingsPipe],
  exports: [TotalFundingsPipe],
})
export class FundingsPipeModule {}
