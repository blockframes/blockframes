import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, Contract, ContractStatus } from '@blockframes/contract/contract/+state';
import { getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { map } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

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
    const lastVersionStatus = (contract: Contract) => getContractLastVersion(contract).status;
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
  selector: 'marketplace-deal-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealListComponent {
  public tabs$ = this.query.sales$.pipe(map(createContractTabs));

  constructor(private query: ContractQuery, private title: Title) {
    this.refreshTitle();
  }

  /**
 * We need to dinstinguish between page load and route change
 * from mat tab component.
 * @param link optional param when the function is getting called from the template 
 */
  public refreshTitle(link?: string) {
    if (link) {
      switch (link) {
        case 'All': this.title.setTitle('All offers and deals - Archipel Content');
          break;
        case 'Offers': this.title.setTitle('Offers and Deals - Archipel Content');
          break;
        case 'Ongoing Deals': this.title.setTitle('Ongoing deals - Archipel Content');
          break;
        case 'Past Deals': this.title.setTitle('Past deals - Archipel Content');
          break;
        case 'Aborted Offers': this.title.setTitle('Aborted offers - Archipel Content');
          break;
      }
    } else {
      Object.keys(this.query.getValue().entities).length
        ? this.title.setTitle('All offers and deals - Archipel Content')
        : this.title.setTitle('Offers and Deals - Archipel Content')
    }
  }
}
