import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  ContractQuery,
  Contract,
  getLastVersionIndex,
  ContractStatus
} from '@blockframes/contract/contract/+state';
import { FormControl } from '@angular/forms';
import { startWith, share } from 'rxjs/operators';

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
    statuses: [ContractStatus.submitted, ContractStatus.undernegotiation, ContractStatus.waitingsignature]
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

  public filter = new FormControl();
  public filter$ = this.filter.valueChanges.pipe(
    startWith(this.filter.value),
    share()
  );

  constructor(private contractQuery: ContractQuery) {}

  public getLabel(label: string, contracts: Contract[]) {
    return `${label} (${contracts.length.toString()})`;
  }

  public filterByStatus(contracts: Contract[], statuses?: string[]) {
    return statuses
      ? contracts.filter(contract => statuses.includes(contract.versions[getLastVersionIndex(contract)].status))
      : contracts;
  }
}
