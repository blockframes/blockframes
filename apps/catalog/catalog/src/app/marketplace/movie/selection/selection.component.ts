import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceQuery, MarketplaceStore } from '../../+state';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { ContractService, TitlesAndRights } from '@blockframes/contract/contract/+state';
import { Observable } from 'rxjs';
import { Intercom } from 'ng-intercom';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSelectionComponent {

  count$ = this.query.selectCount();
  titles$ = this.query.selectAll();
  isInWishist$: Observable<Record<string, Observable<boolean>>>;

  constructor(
    public store: MarketplaceStore,
    private query: MarketplaceQuery,
    private contractService: ContractService,
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
  /**
   * Creates rights and contract and move to tunnel
   */
  async create() {
    const orgId = this.orgQuery.getActiveId();
    const titlesAndRights = {} as TitlesAndRights;
    for (const movieId of this.query.getValue().ids) {
      const { rights } = this.query.getEntity(movieId);
      titlesAndRights[movieId] = rights;
    }
    const contractId = await this.contractService.createContractAndRight(orgId, titlesAndRights);
    await this.router.navigate(['c/o/marketplace/tunnel/contract', contractId, 'sale']);
    this.store.reset();
  }

  openIntercom() {
    this.intercom?.show();
  }
}
