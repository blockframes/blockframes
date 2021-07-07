import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { IncomeService } from '@blockframes/contract/income/+state';
import { filter, tap } from 'rxjs/operators';

@Pipe({ name: 'getIncome' })
export class GetIncomePipe implements PipeTransform {
  constructor(
    private incomeService: IncomeService
  ) { }
  transform(contractId: string) {
    // from income module, income.id===contract.id for the contract that created the model.
    return this.incomeService.valueChanges(contractId).pipe(
      filter(income => !!income),
    );
  }

}

@NgModule({
  exports: [GetIncomePipe],
  declarations: [GetIncomePipe]
})
export class GetIncomePipeModule { }
