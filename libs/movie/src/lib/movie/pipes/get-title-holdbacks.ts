import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { ContractService, Holdback, Sale } from '@blockframes/contract/contract/+state';
import { Term } from '@blockframes/contract/term/+state';

@Pipe({ name: 'getTitleHoldbacks' })
export class GetTitleHoldbacksPipe implements PipeTransform {

  constructor(
    private service: ContractService
  ) { }

  async transform(titleId: string, excludedOrgs: string[] = [''], ): Promise<Holdback[]> {
    return this.service.getValue(
      ref => ref.where('titleId', '==', titleId)
        .where('status', '==', 'accepted')
        .where('type', '==', 'sale')
        .where('buyerId', 'not-in', excludedOrgs)
    ).then(
      contracts => {
        return contracts.map(contract => (contract as Sale).holdbacks).flat();
      }
    );
  }
}

@NgModule({
  declarations: [GetTitleHoldbacksPipe],
  exports: [GetTitleHoldbacksPipe]
})
export class GetTitleHoldbacksPipeModule { }
