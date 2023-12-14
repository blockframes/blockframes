import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Waterfall } from '@blockframes/model';

@Pipe({ name: 'expenseType' })
export class ExpenseTypePipe implements PipeTransform {
  transform(typeId: string, contractId: string, waterfall: Waterfall) {
    return waterfall.expenseTypes[contractId || 'directSales']?.find(type => type.id === typeId)?.name || '--';
  }
}

@NgModule({
  declarations: [ExpenseTypePipe],
  exports: [ExpenseTypePipe],
})
export class ExpenseTypePipeModule { }
