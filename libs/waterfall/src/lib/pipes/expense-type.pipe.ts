import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Waterfall } from '@blockframes/model';

@Pipe({ name: 'expenseType' })
export class ExpenseTypePipe implements PipeTransform {
  transform(typeId: string, contractId: string, waterfall: Waterfall) {
    return waterfall.expenseTypes[contractId || 'directSales']?.find(type => type.id === typeId)?.name || '--';
  }
}

@Pipe({ name: 'expenseTypeStatus' })
export class ExpenseTypeStatusPipe implements PipeTransform {
  transform(amount: number, cap: number): string {
    if (amount / cap <= 0.8) return 'ok';
    if (amount / cap >= 1) return 'alert';
    if (amount / cap > 0.8) return 'warning';
  }
}

@NgModule({
  declarations: [ExpenseTypePipe, ExpenseTypeStatusPipe],
  exports: [ExpenseTypePipe, ExpenseTypeStatusPipe],
})
export class ExpenseTypePipeModule { }
