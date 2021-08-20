import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { ContractService, Holdback, Sale } from '@blockframes/contract/contract/+state';

@Pipe({ name: 'getTitleHoldbacks' })
export class GetTitleHoldbacksPipe implements PipeTransform {

  constructor(
    private service: ContractService
  ) { }

  async transform(titleId: string, { excludedOrgs = [] }: { excludedOrgs: string[] },): Promise<Holdback[]> {
    const contracts = await this.service.getValue(
      ref => ref.where('titleId', '==', titleId)
        .where('status', '==', 'accepted')
        .where('type', '==', 'sale')
        .where('buyerId', 'not-in', excludedOrgs)
    )
    return contracts.map(contract => (contract as Sale).holdbacks).flat();
  }
}

@NgModule({
  declarations: [GetTitleHoldbacksPipe],
  exports: [GetTitleHoldbacksPipe]
})
export class GetTitleHoldbacksPipeModule { }
