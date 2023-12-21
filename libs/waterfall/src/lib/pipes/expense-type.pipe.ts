import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { PricePerCurrency, TitleState, Waterfall, mainCurrency, sum } from '@blockframes/model';

@Pipe({ name: 'expenseType' })
export class ExpenseTypePipe implements PipeTransform {
  transform(typeId: string, contractId: string, waterfall: Waterfall) {
    return waterfall.expenseTypes[contractId || 'directSales']?.find(type => type.id === typeId)?.name || '--';
  }
}

@Pipe({ name: 'expenseTypeAmount' })
export class ExpenseTypeAmountPipe implements PipeTransform {
  transform(expenseTypeId: string, state: TitleState): PricePerCurrency {
    const expenses = Object.values(state.expenses).filter(e => e.typeId === expenseTypeId).map(e => e.amount);
    return { [mainCurrency]: sum(expenses) };
  }
}

@NgModule({
  declarations: [ExpenseTypePipe, ExpenseTypeAmountPipe],
  exports: [ExpenseTypePipe, ExpenseTypeAmountPipe],
})
export class ExpenseTypePipeModule { }
