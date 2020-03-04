import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  ContractQuery,
  Contract,
  ContractService,
  ContractPartyDetail,
  getContractParties,
  isContractSignatory,
  getTotalPrice,
  ContractStatus,
  getContractSubLicensors,
  displayPaymentSchedule
} from '@blockframes/contract/contract/+state';
import { Observable } from 'rxjs/internal/Observable';
import { map, filter } from 'rxjs/operators';
import { ContractVersion, getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery, PLACEHOLDER_LOGO } from '@blockframes/organization';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model/types';
import { getCodeBySlug } from '@blockframes/utils/static-model/staticModels';
import { Price, Terms, termToPrettyDate } from '@blockframes/utils/common-interfaces';
import { Intercom } from 'ng-intercom';

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
  public payments: { type: string, list: string[] } = { type: '', list: [] };

  public oldVersions$ = this.query.oldVersionsView$;

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
        this.subLicensors = getContractSubLicensors(contract);
        this.isSignatory = isContractSignatory(contract, this.organizationQuery.getActiveId());

        this.lastVersion = getContractLastVersion(contract);
        this.payments = displayPaymentSchedule(this.lastVersion);

        this.totalPrice = getTotalPrice(this.lastVersion.titles);

        return contract;
      })
    );
  }

  /** Opens intercom messenger panel. */
  public openIntercom(): void {
    return this.intercom.show();
  }

  public getStatusValue(status: ContractStatus){
    return ContractStatus[status];
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

  /** Format the payment terms for good looking display. */
  public getPaymentTerms(terms: Terms) {
    return termToPrettyDate(terms);
  }
}
