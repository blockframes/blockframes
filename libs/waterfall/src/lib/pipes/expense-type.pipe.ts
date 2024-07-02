import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { ExpenseType, Waterfall } from '@blockframes/model';

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

@Pipe({ name: 'expenseTypeCap' })
export class ExpenseTypeCapPipe implements PipeTransform {
  transform(typeId: string, expenseTypes: ExpenseType[], versionId: string): number {
    if (!typeId) return undefined;
    const expenseType = expenseTypes.find(type => type.id === typeId);
    if (!expenseType) return undefined;
    return versionId && expenseType.cap.version[versionId] ? expenseType.cap.version[versionId] : expenseType.cap.default;
  }
}

@NgModule({
  declarations: [ExpenseTypePipe, ExpenseTypeStatusPipe, ExpenseTypeCapPipe],
  exports: [ExpenseTypePipe, ExpenseTypeStatusPipe, ExpenseTypeCapPipe],
})
export class ExpenseTypePipeModule { }
