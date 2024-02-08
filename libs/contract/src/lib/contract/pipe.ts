import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Term, WaterfallContract, getContractAndAmendments, getCurrentContract, getDeclaredAmount } from '@blockframes/model';

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

@Pipe({ name: 'contractPrice' })
export class ContractPricePipe implements PipeTransform {
  transform(contract: WaterfallContract & { terms: Term[] }) {
    return getDeclaredAmount(contract);
  }
}

@NgModule({
  exports: [GetCurrentContractPipe, ContractPricePipe],
  declarations: [GetCurrentContractPipe, ContractPricePipe]
})
export class ContractPipeModule { }
