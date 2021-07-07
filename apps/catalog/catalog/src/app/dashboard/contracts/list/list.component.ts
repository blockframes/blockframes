import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { startWith, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { Router, ActivatedRoute } from '@angular/router';
import { fromOrg } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { storeStatus } from '@blockframes/utils/static-model';
import { Intercom } from 'ng-intercom';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';

const columns = {
  'offerId': 'Contract Reference',
  'titleId': 'Title',
};

type AllContractStatus = '' | 'contracts' | 'on_going_deals' | 'past_deals';


@Component({
  selector: 'catalog-contract-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractListComponent {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  columns = columns;
  initialColumns = ['offerId', 'titleId',]; // 'sales' should be added here but removed due to the #5060 issue
  filter = new FormControl();
  filter$: Observable<AllContractStatus | ''> = this.filter.valueChanges.pipe(startWith(this.filter.value || ''));
  contracts$ = this.service.valueChanges().pipe(tap(s => console.log({ s })));

  constructor(
    private service: ContractService,
    private router: Router,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private orgQuery: OrganizationQuery,
    private routerQuery: RouterQuery,
    @Optional() private intercom: Intercom
  ) { }

  /** Dynamic filter of contracts for each tab. */
  applyFilter(filter?: AllContractStatus) {
    this.filter.setValue(filter);
    this.dynTitle.setPageTitle(storeStatus[filter]);
  }

  /* index paramater is unused because it is a default paramater from the filter javascript function */
  filterByStatus(contract: Contract, index: number, value: AllContractStatus): boolean {
    switch (value) {
      case 'contracts':
        return ["accepted"].includes(contract.status);
      case 'on_going_deals':
        return ["pending"].includes(contract.status);
      case 'past_deals':
        return ["archived", "declined"].includes(contract.status);
      default:
        return true;
    }
  }

  resetFilter() {
    this.filter.reset();
    this.dynTitle.useDefault();
  }

  goToTitle(contract: Contract) {
    this.router.navigate([contract.id], { relativeTo: this.route });
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
