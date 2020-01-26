import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, Contract, ContractStatus } from '@blockframes/contract/contract/+state';
import { DistributionDealService, DistributionDealQuery, DistributionDeal } from '@blockframes/movie/distribution-deals/+state';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery } from '@blockframes/organization';
import { Party } from '@blockframes/utils/common-interfaces';
import { BehaviorSubject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

interface DealWithContract extends DistributionDeal {
  contract: Contract;
}

/** Check if a contract is "done" by looking at the status of the last version */
function isDone({ versions }: Contract): boolean {
  const { status } = versions[versions.length - 1];
  return status === ContractStatus.accepted
    || status === ContractStatus.paid
    || status === ContractStatus.waitingpaiment;
}

/** Check if role of the orgId is the one specify */
function orgHasRole({ parties }: Contract, orgId: string, role: Party['role']): boolean {
  return parties.find(party => party.party.orgId === orgId).party.role === role;
}

@Component({
  selector: 'catalog-title-avails',
  templateUrl: './avails.component.html',
  styleUrls: ['./avails.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleAvailsComponent implements OnInit {

  private country$ = new BehaviorSubject<string>('');
  contract$ = this.contractQuery.selectAll();

  constructor(
    private orgQuery: OrganizationQuery,
    private contractQuery: ContractQuery,
    private dealQuery: DistributionDealQuery,
  ) { }

  ngOnInit() {
    const orgId = this.orgQuery.getActiveId();
    this.country$.pipe(
      switchMap(country => this.dealQuery.selectAll({ filterBy: (deal) => deal.territory.includes(country) })),
      switchMap(deals => {
        // Get only the contract that are done with org a sub-licensor
        const dealWithContract: DealWithContract[] = [];
        for (const deal of deals) {
          const contract = this.contractQuery.getEntity(deal.contractId); 
          if (isDone(contract) && orgHasRole(contract, orgId, 'sub-licensor')) {
            dealWithContract.push({ ...deal, contract })
          }
        }
        return dealWithContract;
      }),
    );
  }

  getBuyer(contract: Contract): Party {
    return contract.parties.find(({party}) => party.role === 'licensee').party;
  }

}
