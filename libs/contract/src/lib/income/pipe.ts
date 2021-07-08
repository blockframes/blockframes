import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { Income, IncomeService } from '@blockframes/contract/income/+state';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

@Pipe({ name: 'getIncome', pure: true })
export class GetIncomePipe implements PipeTransform {
  record: Record<string, Observable<Income>> = {};
  constructor(
    private incomeService: IncomeService
  ) {
    console.log('contract constructor');
  }

  transform(contractId: string) {
    if (!this.record[contractId]) {
      // console.log({ contractId })
      this.record[contractId] = this.incomeService.valueChanges(contractId).pipe(
        // tap(contract => console.log({ contract })),
      );
    }
    return this.record[contractId]
  }
}

@Pipe({ name: 'getIncomesFromTitle' })
export class GetIncomesFromTitlePipe implements PipeTransform {
  constructor(
    private contractService: ContractService,
    private incomeService: IncomeService
  ) { }

  transform(titleId: string) {
    return this.contractService.valueChanges(ref =>
      ref.where('titleId', '==', titleId)
        .where('status', '==', 'approved')
        .where('type', '==', 'sale')
    ).pipe(
      map(contracts => contracts.map(contract => contract.id)),
      switchMap(contractIds => this.incomeService.valueChanges(contractIds)),
    );
  }
}

@NgModule({
  exports: [GetIncomesFromTitlePipe, GetIncomePipe],
  declarations: [GetIncomesFromTitlePipe, GetIncomePipe]
})
export class IncomePipeModule { }
