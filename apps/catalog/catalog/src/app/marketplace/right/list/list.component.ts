import { MatTabChangeEvent } from '@angular/material/tabs';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, Contract } from '@blockframes/contract/contract/+state';
import { ContractStatus } from '@blockframes/utils/static-model';
import { map } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

interface Tab {
  name: string;
  statuses?: ContractStatus[];
}

interface ContractTab {
  name: string;
  contracts: Contract[]
}

const contractTabs: Tab[] = [
  {
    name: 'All'
  },
  {
    name: 'Offers',
    statuses: [
      'submitted',
      'undernegotiation',
      'waitingsignature'
    ]
  },
  {
    name: 'Ongoing Deals',
    statuses: ['accepted', 'waitingpayment']
  },
  {
    name: 'Past Deals',
    statuses: ['paid']
  },
  {
    name: 'Aborted Offers',
    statuses: ['rejected']
  }
];

/**
 * Returns a filtered list of contracts according to their statuses.
 * @param contracts List of contract to filter
 * @param statuses List of status to filter onto
 */
function filterByStatus(contracts: Contract[], statuses?: ContractStatus[]) {
  if (statuses) {
    const lastVersionStatus = (contract: Contract) => contract.lastVersion.status;
    return contracts.filter(contract => statuses.includes(lastVersionStatus(contract)));
  }
  return contracts;
}

/**
 * Transform the list of tabs above into a list of contract tabs
 * @param allContracts The list of contracts
 */
function createContractTabs(allContracts: Contract[]): ContractTab[] {
  return contractTabs.map(tab => {
    const contracts = filterByStatus(allContracts, tab.statuses);
    return { name: tab.name, contracts };
  })
}

@Component({
  selector: 'marketplace-right-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightListComponent {
  public tabs$ = this.query.sales$.pipe(map(createContractTabs));
  public salesLoading$ = this.query.selectLoading();

  constructor(private query: ContractQuery, private dynTitle: DynamicTitleService) {
    this.query.getCount()
      ? this.dynTitle.setPageTitle('All offers and deals')
      : this.dynTitle.setPageTitle('No offers and deals')
  }

  /**
 * We need to dinstinguish between page load and route change
 * from mat tab component.
 * @param link optional param when the function is getting called from the template
 */
  public refreshTitle(event: MatTabChangeEvent) {
    contractTabs[event.index].name !== 'All'
      ? this.dynTitle.setPageTitle(contractTabs[event.index].name)
      : this.dynTitle.useDefault();
  }
}
