import { Intercom } from 'ng-intercom';
import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { ContractQuery, ContractService, Contract } from '@blockframes/contract/contract/+state';
import { ContractStatus } from '@blockframes/utils/static-model';
import { map } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Router, ActivatedRoute } from '@angular/router';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatTabChangeEvent } from '@angular/material/tabs';

interface Tab {
  name: string;
  statuses?: ContractStatus[];
}

interface ContractTab {
  name: string;
  contracts: Contract[]
}

const contractTab: Tab[] = [
  {
    name: 'All'
  },
  {
    name: 'Draft',
    statuses: [
      'draft',
      'submitted',
    ]
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
    statuses: [
      'accepted',
      'waitingpayment',
      'paid'
    ]
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
function createContractTab(allContracts: Contract[]): ContractTab[] {
  return contractTab.map(tab => {
    const contracts = filterByStatus(allContracts, tab.statuses);
    return { name: tab.name, contracts };
  })
}


@Component({
  selector: 'catalog-right-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightListComponent {
  public tabs$ = this.query.sales$.pipe(map(createContractTab));
  public salesLoading$ = this.query.selectLoading();

  constructor(
    @Optional() private intercom: Intercom,
    private orgQuery: OrganizationQuery,
    private query: ContractQuery,
    private contractService: ContractService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
  ) {
    this.query.getCount()
      ? this.dynTitle.setPageTitle('All offers and deals')
      : this.dynTitle.setPageTitle('Offers and Deals')
  }


  public updateTitle(event: MatTabChangeEvent) {
    const currentTabName = contractTab[event.index].name
    currentTabName !== 'All'
    ? this.dynTitle.setPageTitle(currentTabName)
    : this.dynTitle.useDefault();
  }

  /** Create a sale and redirect to tunnel */
  async createSale() {
    const type = 'sale';
    const contractId = await this.contractService.create({ type });
    this.router.navigate(['../tunnel/contract', contractId, type], { relativeTo: this.route })
  }

  /**
   * Create a mandate if organization doesn't have one yet
   * @note This method is not implemented yet because Mandate page doesn't exist yet
   */
  async createMandate() {
    const type = 'mandate';
    const orgId = this.orgQuery.getActiveId();
    const mandate = await this.contractService.getMandate(orgId);
    if (mandate) {
      this.router.navigate([mandate.id], { relativeTo: this.route })
    } else {
      const contractId = await this.contractService.create({ type });
      this.router.navigate(['../tunnel/contract', contractId, type], { relativeTo: this.route })
    }
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
