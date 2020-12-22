import { NgModule, Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { CommonModule, getCurrencySymbol, formatCurrency } from '@angular/common';
import { Budget } from '../+state';

function getTotalBudget(budget: Budget) {
  const { development, shooting, postProduction, administration, contingency } = budget;
  return [development, shooting, postProduction, administration, contingency]
  .reduce((sum, value) => value ? sum + value : sum, 0);
}


@Pipe({ name: 'budget' })
export class BudgetPipe implements PipeTransform {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
  ) {}

  transform(budget: Budget, currency: string): string {
    const totalBudget = getTotalBudget(budget);
    const currencySymbol = getCurrencySymbol(currency, 'narrow');

    if(totalBudget === 0) return 'N/C';
    return formatCurrency(totalBudget, this.locale, currencySymbol, 'symbol', '1.0-0');
  }
}


@NgModule({
  declarations: [BudgetPipe],
  imports: [CommonModule],
  exports: [BudgetPipe]
})
export class BudgetPipeModule { }
