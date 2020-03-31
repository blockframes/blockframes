import { Component, ChangeDetectionStrategy, HostBinding, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceQuery, MarketplaceStore } from '../../+state';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import {
  ContractService,
  Contract,
  createContractPartyDetail,
  createContractTitleDetail
} from '@blockframes/contract/contract/+state';
import { ContractVersion } from '@blockframes/contract/version/+state';
import { createParty } from '@blockframes/utils/common-interfaces';
import { Observable } from 'rxjs';
import { DistributionDealService } from '@blockframes/distribution-deals/+state/distribution-deal.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Intercom } from 'ng-intercom';
import { OrganizationQuery } from '@blockframes/organization/organization/+state/organization.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSelectionComponent {
  @HostBinding('attr.page-id') pageId = 'catalog-selection';

  count$ = this.query.selectCount();
  titles$ = this.query.selectAll();
  isInWishist$: Observable<Record<string, Observable<boolean>>>;

  constructor(
    public store: MarketplaceStore,
    private db: AngularFirestore,
    private query: MarketplaceQuery,
    private service: ContractService,
    private dealService: DistributionDealService,
    private movieQuery: MovieQuery,
    private orgQuery: OrganizationQuery,
    private router: Router,
    @Optional() private intercom: Intercom,
    private dynTitle: DynamicTitleService
  ) {
    this.query.getCount()
      ? this.dynTitle.setPageTitle('My Selection')
      : this.dynTitle.setPageTitle('No selections yet')
  }

  /** Select a movie for a specific movie Id */
  selectMovie(movieId: string) {
    return this.movieQuery.selectEntity(movieId);
  }

  removeTitle(movieId: string) {
    this.store.remove(movieId);
  }

  /** Create a Contract, remove the current selection, move to tunnel */
  async create() {
    // @todo(#2041) need to define it here as we cannot use DistributionDealService in ContractService -> Circular Dependancy
    const contractId = this.db.createId();
    const org = this.orgQuery.getActive();
    const type = 'sale';

    // Initialize parties
    const parties: Contract['parties'] = [
      createContractPartyDetail({
        party: createParty({ role: 'licensee', orgId: org.id, displayName: org.denomination.full }),
        // TODO #2311 DisplayName has to be define in a guard !
      }),
      createContractPartyDetail({ party: createParty({ role: 'licensor' }) })
    ];
    const titleIds = this.query.getValue().ids;

    // Create contract & Version
    const contract: Partial<Contract> = { id: contractId, titleIds, parties, type };
    const version: Partial<ContractVersion> = { titles: {} };

    // Create deals per titles
    // Ideally we would do that in the ContractService, but blocked by Circular Dependancy
    for (const movieId of titleIds) {
      const { deals } = this.query.getEntity(movieId);
      const dealDocs = deals.map(deal => ({ ...deal, contractId }));
      const distributionDealIds = await this.dealService.add(dealDocs, { params: { movieId } });
      version.titles[movieId] = createContractTitleDetail({ distributionDealIds });
    }
    await this.service.create(contract, version);

    await this.router.navigate(['c/o/marketplace/tunnel/contract', contractId, type]);
    this.store.reset();
  }

  openIntercom() {
    this.intercom?.show();
  }
}
