import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
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
