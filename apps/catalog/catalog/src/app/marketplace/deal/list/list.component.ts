import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ContractQuery, Contract, ContractStatus } from '@blockframes/contract/contract/+state';
import { getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { DistributionDealService } from '@blockframes/movie/distribution-deals';
import { map, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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
export class DealListComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  public tabs$ = this.query.sales$.pipe(map(createContractTabs));

  constructor(private query: ContractQuery, private dealService: DistributionDealService) { }

  ngOnInit() {
    this.sub = this.query.sales$.pipe(
      switchMap(contracts => this.dealService.syncContractsDeals(contracts))
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
