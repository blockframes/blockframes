import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { MarketplaceQuery, MarketplaceStore } from '../../+state';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
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
    private movieQuery: MovieQuery,
    private orgQuery: OrganizationQuery,
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
  create() {
    this.store.reset();
  }

  openIntercom() {
    this.intercom?.show();
  }
}
