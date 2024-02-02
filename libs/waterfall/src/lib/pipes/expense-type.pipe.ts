import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { PricePerCurrency, Waterfall, convertCurrenciesTo, mainCurrency } from '@blockframes/model';

@Pipe({ name: 'expenseType' })
export class ExpenseTypePipe implements PipeTransform {
  transform(typeId: string, contractId: string, waterfall: Waterfall) {
    return waterfall.expenseTypes[contractId || 'directSales']?.find(type => type.id === typeId)?.name || '--';
  }
}

@Pipe({ name: 'expenseTypeStatus' })
export class ExpenseTypeStatusPipe implements PipeTransform {
  transform(amount: PricePerCurrency, cap: PricePerCurrency, currency = mainCurrency): string {
    const currentValue = convertCurrenciesTo(amount, currency)[currency];
    const capValue = convertCurrenciesTo(cap, currency)[currency];
    if (currentValue / capValue <= 0.8) return 'ok';
    if (currentValue / capValue >= 1) return 'alert';
    if (currentValue / capValue > 0.8) return 'warning';
  }
}

@NgModule({
  declarations: [ExpenseTypePipe, ExpenseTypeStatusPipe],
  exports: [ExpenseTypePipe, ExpenseTypeStatusPipe],
})
export class ExpenseTypePipeModule { }
