import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  ContractQuery,
  Contract,
  ContractService,
  ContractPartyDetail
} from '@blockframes/contract/+state';
import { Observable } from 'rxjs/internal/Observable';
import { map, filter } from 'rxjs/operators';
import { ContractVersion } from '@blockframes/contract/version/+state/contract-version.model';
import { MovieQuery, Movie } from '@blockframes/movie';
import { createPrice } from '@blockframes/utils/common-interfaces';
import { OrganizationQuery } from '@blockframes/organization';
import { Intercom } from 'ng-intercom';
import { IntercomAppModule } from '@blockframes/utils/intercom.module';

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
  public versions: ContractVersion[];
  public isSignatory: boolean;

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
        this.isSignatory = this.service.isContractSignatory(contract, this.organizationQuery.getActiveId());
        this.versions = contract.versions.filter(version => !!version.creationDate);
        this.lastVersion = this.versions.reduce((a, b) =>
          a.creationDate > b.creationDate ? a : b
        );
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
