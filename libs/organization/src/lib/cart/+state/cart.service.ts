import { Movie } from '@blockframes/movie/+state/movie.model';
import { Injectable } from '@angular/core';
import { CartState, CartStore } from './cart.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs/:orgId/carts' })
export class CartService extends CollectionService<CartState> {

  constructor(
    private organizationQuery: OrganizationQuery,
    private organizationService: OrganizationService,
    protected store: CartStore,
    private analytics: FireAnalytics,
  ) {
    super(store);
  }

  /**
   *
   * @param movie
   */
  public async updateWishlist(movie: Movie) {
    const orgState = this.organizationQuery.getActive();
    let wishlist = [...orgState.wishlist] || [];
    if (wishlist.includes(movie.id)) {
      wishlist = orgState.wishlist.filter(id => id !== movie.id);
      this.analytics.event('removedFromWishlist', {
        movieId: movie.id,
        movieTitle: movie.title.original
      });
    } else {
      wishlist.push(movie.id);
      this.analytics.event('addedToWishlist', {
        movieId: movie.id,
        movieTitle: movie.title.original
      });
    }

    this.organizationService.update({ ...orgState, wishlist });
  }
}
