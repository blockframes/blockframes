import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  ContractQuery,
  Contract,
  ContractService,
  ContractPartyDetail,
  getLastVersionIndex
} from '@blockframes/contract/contract/+state';
import { Observable } from 'rxjs/internal/Observable';
import { map, filter } from 'rxjs/operators';
import { ContractVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { MovieQuery, Movie } from '@blockframes/movie';
import { createPrice } from '@blockframes/utils/common-interfaces';
import { OrganizationQuery } from '@blockframes/organization';
import { IntercomAppModule } from '@blockframes/utils/intercom.module';

const columns = {
  date: 'Date',
  offer: 'Offer Amount',
  status: 'Status'
}

interface VersionView {
  date: string;
  offer: string;
  status: string;
}

function getVersionPrice(version: ContractVersion) {
  let amount = 0;
  let currency = '';
  for (const title of Object.values(version.titles)) {
    amount += title.price.amount;
    currency = title.price.currency;
  }
  return amount.toString() + currency;
}

function createVersionView(version: ContractVersion): VersionView {
  return {
    date: version.creationDate.toLocaleDateString(),
    offer: getVersionPrice(version),
    status: version.status.toUpperCase()
  }
}

@Component({
  selector: 'catalog-deal-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealViewComponent implements OnInit {
  public contract$: Observable<Contract>;
  public movies$: Observable<Movie[]>;
  public licensees: ContractPartyDetail[];
  public subLicensors: ContractPartyDetail[];
  public lastVersion: ContractVersion;
  public versions: VersionView[];
  public isSignatory: boolean;

  public columns = columns;
  public initialColumns = ['date', 'offer', 'status']

  constructor(
    private query: ContractQuery,
    private service: ContractService,
    private movieQuery: MovieQuery,
    private organizationQuery: OrganizationQuery,
    private intercomModule: IntercomAppModule
  ) {}

  ngOnInit() {
    this.contract$ = this.query.selectActive().pipe(
      filter(contract => !!contract),
      map(contract => {
        this.licensees = this.service.getContractParties(contract, 'licensee');
        this.subLicensors = this.service.getContractParties(contract, 'sub-licensor');

        const versions = contract.versions.filter(version => version.id !== '_meta');
        this.versions = versions.map(version => createVersionView(version));
        console.log(this.versions)

        this.isSignatory = this.service.isContractSignatory(contract, this.organizationQuery.getActiveId());
        this.lastVersion = contract.versions[getLastVersionIndex(contract)];
        return contract;
      })
    );
    this.movies$ = this.movieQuery.selectAll();
  }

  /**
   * Combine prices of all distributionDeals to get the total price of the contract.
   *
   * @dev this is temporary solution, if there is different currencies in distributionDeals
   * the result will be wrong.
   */
  get totalPrice() {
    const result = createPrice();
    for (const title of Object.values(this.lastVersion.titles)) {
      result.amount += title.price.amount;
      result.currency = title.price.currency;
    }
    return result;
  }

  /** Opens intercom messenger panel. */
  public openIntercom() {
    this.intercomModule.intercom.show();
  }

  public acceptOffer(contract: Contract) {
    this.service.acceptOffer(contract, this.organizationQuery.getActiveId());
  }

  public declineOffer(contract: Contract) {
    this.service.declineOffer(contract, this.organizationQuery.getActiveId());
  }
}
