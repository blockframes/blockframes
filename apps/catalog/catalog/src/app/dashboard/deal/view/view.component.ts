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
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state';
import { MovieCurrenciesSlug, MediasSlug, LanguagesSlug } from '@blockframes/utils/static-model/types';
import { getCodeBySlug } from '@blockframes/utils/static-model/staticModels';
import { CurrencyPipe } from '@angular/common';
import { MovieLanguageSpecification } from '@blockframes/movie/movie+state/movie.firestore';

const versionColumns = {
  date: 'Date',
  offer: 'Offer Amount',
  status: 'Status'
}

const dealColumns = {
  territory: 'Territory',
  startDate: 'Start Date',
  rights: 'Rights',
  languages: 'Languages',
  holdback: 'Holdback',
  firstBroadcastDate: '1st Broadcast Date'
}

interface VersionView {
  date: string;
  offer: string;
  status: string;
}

interface MovieWithDealViews {
  movie: Movie;
  deals: DealView[];
}

interface DealView {
  territory: string [];
  startDate: string;
  rights: MediasSlug[] | string;
  languages: string;
  holdback: string;
  firstBroadcastDate: string;
}

function getVersionPrice(version: ContractVersion) {
  const currencyPipe = new CurrencyPipe('en-US')
  let amount = 0;
  let currency: MovieCurrenciesSlug;
  for (const title of Object.values(version.titles)) {
    amount += title.price.amount;
    currency = getCodeBySlug('MOVIE_CURRENCIES', title.price.currency)
  }
  return currencyPipe.transform(amount, currency, true)
}

function createVersionView(version: ContractVersion): VersionView {
  return {
    date: version.creationDate.toLocaleDateString(),
    offer: getVersionPrice(version),
    status: version.status.toUpperCase()
  }
}

function createDealView(deal: DistributionDeal): DealView {
  return {
    territory: deal.territory,
    startDate: deal.terms.start instanceof Date ? deal.terms.start.toLocaleDateString() : '',
    rights: deal.licenseType,
    languages: '',
    holdback: '',
    firstBroadcastDate: new Date().toLocaleDateString()
  };
}

function createMovieWithDealViews(movie: Movie): MovieWithDealViews {
  return {
    movie,
    deals: movie.distributionDeals.map(deal => createDealView(deal))
  };
}

@Component({
  selector: 'catalog-deal-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DealViewComponent implements OnInit {
  public contract$: Observable<Contract>;
  public licensees: ContractPartyDetail[];
  public subLicensors: ContractPartyDetail[];
  public moviesLenght$: Observable<number>;
  public lastVersion: ContractVersion;
  public isSignatory: boolean;

  public versions: VersionView[];
  public versionColumns = versionColumns;
  public initialVersionColumns = ['date', 'offer', 'status'];

  public moviesWithDeals$: Observable<MovieWithDealViews[]>;
  public dealColumns = dealColumns;
  public initialDealColumns = ['territory', 'startDate', 'rights', 'languages', 'holdback', 'firstBroadcastDate'];

  public placeholderUrl = PLACEHOLDER_LOGO;

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

        this.isSignatory = this.service.isContractSignatory(contract, this.organizationQuery.getActiveId());
        this.lastVersion = contract.versions[getLastVersionIndex(contract)];
        this.moviesWithDeals$ = this.movieQuery.selectAll().pipe(
          map(movies => movies.map(movie => createMovieWithDealViews(movie)))
        )

        return contract;
      })
    );

    this.moviesLenght$ = this.movieQuery.selectCount();
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

  public acceptOffer(contract: Contract): void {
    return this.service.acceptOffer(contract, this.organizationQuery.getActiveId());
  }

  public declineOffer(contract: Contract): void {
    return this.service.declineOffer(contract, this.organizationQuery.getActiveId());
  }

  public getCurrencyCode(currency: MovieCurrenciesSlug) {
    return getCodeBySlug('MOVIE_CURRENCIES', currency);
  }

  public showMovie(movieId: string): boolean {
    return this.movieQuery.hasEntity(movieId);
  }
}
