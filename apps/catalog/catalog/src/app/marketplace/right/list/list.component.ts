import { MatTabChangeEvent } from '@angular/material/tabs';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery } from '@blockframes/contract/contract/+state';
import { ContractStatus } from '@blockframes/utils/static-model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

interface Tab {
  name: string;
  statuses?: ContractStatus[];
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

@Component({
  selector: 'marketplace-right-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightListComponent {
  public tabs$ = this.query.selectAll()
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
