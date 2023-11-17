import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { WaterfallContract, getContractAndAmendments, getCurrentContract } from '@blockframes/model';

@Pipe({ name: 'getCurrentContract' })
export class GetCurrentContractPipe implements PipeTransform {
  transform(contractId: string, _contracts: WaterfallContract[] = [], date?: Date): string {
    if (!_contracts?.length) return '--';
    const contracts = getContractAndAmendments(contractId, _contracts);
    const current = getCurrentContract(contracts, date);
    if (!current) return '--';
    return current.rootId ? `${current.id} (${current.rootId})` : current.id;
  }
}

@NgModule({
  exports: [GetCurrentContractPipe],
  declarations: [GetCurrentContractPipe]
})
export class ContractPipeModule { }
