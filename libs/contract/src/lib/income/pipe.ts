import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { where } from 'firebase/firestore';
import { map, switchMap } from 'rxjs/operators';

@Pipe({ name: 'getIncome', pure: true })
export class GetIncomePipe implements PipeTransform {
  constructor(private service: IncomeService) { }

  transform(contractId: string) {
    return this.service.valueChanges(contractId);
  }
}

@Pipe({ name: 'getIncomesFromTitle' })
export class GetIncomesFromTitlePipe implements PipeTransform {
  constructor(
    private contractService: ContractService,
    private incomeService: IncomeService
  ) { }

  transform(titleId: string) {
    return this.contractService.valueChanges([
      where('titleId', '==', titleId),
      where('status', '==', 'accepted'),
      where('type', '==', 'sale')
    ]).pipe(
      map(contracts => contracts.map(contract => contract.id)),
      switchMap(contractIds => this.incomeService.valueChanges(contractIds)),
      map(incomes => incomes.filter(income => income))
    );
  }
}

@NgModule({
  exports: [GetIncomesFromTitlePipe, GetIncomePipe],
  declarations: [GetIncomesFromTitlePipe, GetIncomePipe]
})
export class IncomePipeModule { }
