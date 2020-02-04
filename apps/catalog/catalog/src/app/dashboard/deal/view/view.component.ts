import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  ContractQuery,
  Contract,
  ContractService,
  ContractPartyDetail,
  getContractParties,
  isContractSignatory,
  getTotalPrice,
  ContractStatus
} from '@blockframes/contract/contract/+state';
import { Observable } from 'rxjs/internal/Observable';
import { map, filter } from 'rxjs/operators';
import { ContractVersion, getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery, PLACEHOLDER_LOGO } from '@blockframes/organization';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model/types';
import { getCodeBySlug } from '@blockframes/utils/static-model/staticModels';
import { CurrencyPipe } from '@angular/common';
import { Price } from '@blockframes/utils/common-interfaces';
import { Intercom } from 'ng-intercom';

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
function getVersionPrice(version: ContractVersion): string {
  const currencyPipe = new CurrencyPipe('en-US');
  const titles = Object.values(version.titles);
  const amount = titles.reduce((sum, title) => sum += title.price.amount, 0);
  const currency = getCodeBySlug('MOVIE_CURRENCIES', titles[titles.length - 1].price.currency);

  return currencyPipe.transform(amount, currency, true);
}

/** Factory function to create VersionView. */
function createVersionView(version: ContractVersion): VersionView {
  if (version) {
    return {
      date: version.creationDate.toLocaleDateString(),
      offer: getVersionPrice(version),
      status: ContractStatus[version.status]
    };
  }
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
  public movies$ = this.movieQuery.selectAll();
  public lastVersion: ContractVersion;
  public isSignatory: boolean;
  public totalPrice: Price;

  public versions: VersionView[];
  public versionColumns = versionColumns;
  public initialVersionColumns = ['date', 'offer', 'status'];

  public placeholderUrl = PLACEHOLDER_LOGO;

  constructor(
    private query: ContractQuery,
    private service: ContractService,
    private movieQuery: MovieQuery,
    private organizationQuery: OrganizationQuery,
    private intercom: Intercom
  ) {}

  ngOnInit() {
    this.contract$ = this.query.selectActive().pipe(
      filter(contract => !!contract),
      map(contract => {
        this.licensees = getContractParties(contract, 'licensee');
        this.subLicensors = getContractParties(contract, 'sub-licensor');
        this.isSignatory = isContractSignatory(contract, this.organizationQuery.getActiveId());

        // Get all contract versions except _meta.
        const versions = contract.versions.filter(version => version.id !== '_meta');
        // Create flattened version to be send in reusable table.
        this.versions = versions.map(version => createVersionView(version));
        this.lastVersion = getContractLastVersion(contract);

        this.totalPrice = getTotalPrice(this.lastVersion.titles);

        return contract;
      })
    );
  }

  /** Opens intercom messenger panel. */
  public openIntercom(): void {
    return this.intercom.show();
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
