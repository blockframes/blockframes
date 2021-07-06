import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { map, switchMap, tap } from 'rxjs/operators';

@Pipe({ name: 'getIncomesFromTitle' })
export class GetIncomesFromTitlePipe implements PipeTransform {
  constructor(
    private contractService: ContractService,
    private incomeService: IncomeService
  ) { }
  transform(titleId: string) {
    return this.contractService.valueChanges(ref => ref.where('titleId', '==', titleId).where('status', '==', 'approved')).pipe(
      map(contracts => contracts.map(contract => contract.id)),
      switchMap(contractIds => this.incomeService.valueChanges(contractIds)),
      tap(s => console.log({s}))
    );
  }
}

@NgModule({
  exports: [GetIncomesFromTitlePipe],
  declarations: [GetIncomesFromTitlePipe]
})
export class GetIncomeFromTitleModule { }
