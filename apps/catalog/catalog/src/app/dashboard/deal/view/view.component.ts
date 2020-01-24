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
import { OrganizationQuery, PLACEHOLDER_LOGO } from '@blockframes/organization';
import { IntercomAppModule } from '@blockframes/utils/intercom.module';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model/types';
import { getCodeBySlug } from '@blockframes/utils/static-model/staticModels';
import { CurrencyPipe } from '@angular/common';
import { capitalize } from '@blockframes/utils/helpers';

const versionColumns = {
  date: 'Date',
  offer: 'Offer Amount',
  status: 'Status'
};

/** Flattened data of version to pass in bf-table-filer. */
interface VersionView {
  date: string;
  offer: string;
  status: string;
}

/** Returns version price as a formated string. */
function getVersionPrice(version: ContractVersion) {
  const currencyPipe = new CurrencyPipe('en-US');
  let amount = 0;
  let currency: MovieCurrenciesSlug;
  for (const title of Object.values(version.titles)) {
    amount += title.price.amount;
    currency = getCodeBySlug('MOVIE_CURRENCIES', title.price.currency);
  }
  return currencyPipe.transform(amount, currency, true);
}

/** Factory function to create VersionView. */
function createVersionView(version: ContractVersion): VersionView {
  return {
    date: version.creationDate.toLocaleDateString(),
    offer: getVersionPrice(version),
    status: capitalize(version.status)
  };
}

@Component({
  selector: 'catalog-deal-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealViewComponent implements OnInit {
  public isLoading$: Observable<boolean>;
  public contract$: Observable<Contract>;
  public licensees: ContractPartyDetail[];
  public subLicensors: ContractPartyDetail[];
  public movies$: Observable<Movie[]>;
  public lastVersion: ContractVersion;
  public isSignatory: boolean;

  public versions: VersionView[];
  public versionColumns = versionColumns;
  public initialVersionColumns = ['date', 'offer', 'status'];

  public placeholderUrl = PLACEHOLDER_LOGO;

  // Column & rows
  public displayedColumns$: Observable<string[]>;

  constructor(
    private query: ContractQuery,
    private service: ContractService,
    private movieQuery: MovieQuery,
    private organizationQuery: OrganizationQuery,
    private intercomModule: IntercomAppModule
  ) {}

  ngOnInit() {
    this.isLoading$ = this.query.selectLoading();

    this.contract$ = this.query.selectActive().pipe(
      filter(contract => !!contract),
      map(contract => {
        this.licensees = this.service.getContractParties(contract, 'licensee');
        this.subLicensors = this.service.getContractParties(contract, 'sub-licensor');

        const versions = contract.versions.filter(version => version.id !== '_meta');
        this.versions = versions.map(version => createVersionView(version));

        this.isSignatory = this.service.isContractSignatory(
          contract,
          this.organizationQuery.getActiveId()
        );
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
  public openIntercom(): void {
    return this.intercomModule.intercom.show();
  }

  /** Accept the offer and sign with a timestamp. */
  public acceptOffer(contract: Contract): void {
    return this.service.acceptOffer(contract, this.organizationQuery.getActiveId());
  }

  /** Decline the offer. */
  public declineOffer(contract: Contract): void {
    return this.service.declineOffer(contract, this.organizationQuery.getActiveId());
  }

  /** Utils function to get currency code for currency pipe. */
  public getCurrencyCode(currency: MovieCurrenciesSlug) {
    return getCodeBySlug('MOVIE_CURRENCIES', currency);
  }

  /** Check if the movie is in the store. */
  public showMovie(movieId: string): boolean {
    return this.movieQuery.hasEntity(movieId);
  }
}
