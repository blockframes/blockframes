import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, Contract, ContractStatus } from '@blockframes/contract/contract/+state';
import { getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';

interface Tabs {
  name: string;
  statuses?: ContractStatus[];
}

const contractTabs: Tabs[] = [
  {
    name: 'All'
  },
  {
    name: 'Offers',
    statuses: [
      ContractStatus.submitted,
      ContractStatus.undernegotiation,
      ContractStatus.waitingsignature
    ]
  },
  {
    name: 'Ongoing Deals',
    statuses: [ContractStatus.accepted, ContractStatus.waitingpaiment]
  },
  {
    name: 'Past Deals',
    statuses: [ContractStatus.paid]
  },
  {
    name: 'Aborted Offers',
    statuses: [ContractStatus.rejected]
  }
];

@Component({
  selector: 'catalog-deal-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealListComponent {
  public contracts$ = this.contractQuery.selectAll();
  public contractTabs = contractTabs;

  constructor(private contractQuery: ContractQuery) {}

  /**
   * Create a custom label with a name and a length for the tab.
   * @param label
   * @param contracts
   */
  public getLabel(label: string, contracts: Contract[]) {
    return `${label} (${contracts.length.toString()})`;
  }

  /**
   * Returns a filtered list of contracts according to their statuses.
   * @param contracts
   * @param statuses
   */
  public filterByStatus(contracts: Contract[], statuses?: ContractStatus[]) {
    if (statuses) {
      const lastVersionStatus = (contract: Contract) => getContractLastVersion(contract).status;
      return contracts.filter(contract => statuses.includes(lastVersionStatus(contract)));
    }
    return contracts;
  }
}
