import { switchMap } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { BasketQuery } from './basket.query';
import { Injectable } from '@angular/core';
import { CatalogBasket, createBasket, DistributionRight } from './basket.model';
import { OrganizationQuery, OrganizationService } from '@blockframes/organization';
import { BasketState, BasketStore } from './basket.store';
import { CollectionConfig, syncQuery, Query, CollectionService } from 'akita-ng-fire';
import { WishlistStatus, WishlistWithDates } from '@blockframes/organization/types';

const basketsQuery = (organizationId: string): Query<CatalogBasket> => ({
  path: `orgs/${organizationId}/baskets`,
  queryFn: ref => ref.where('status', '==', 'pending')
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs/:orgId/baskets' })
export class BasketService extends CollectionService<BasketState> {
  syncQuery = syncQuery.bind(this, basketsQuery(this.organizationQuery.getValue().org.id));

  constructor(
    private organizationQuery: OrganizationQuery,
    private basketQuery: BasketQuery,
    private organizationService: OrganizationService,
    store: BasketStore
  ) {
    super(store);
  }

  public syncBasket() {
    return this.organizationQuery
      .select('org')
      .pipe(switchMap(({ id }) => this.syncCollection({ pathParams: { orgId: id } })));
  }

  public addBasket(basket: CatalogBasket) {
    const id = this.db.createId();
    const newBasket: CatalogBasket = createBasket({
      id,
      price: { amount: 0, currency: 'euro' },
      rights: basket.rights
    });
    this.db.doc<CatalogBasket>(`orgs/${this.organizationQuery.id}/baskets/${id}`).set(newBasket);
  }

  public async updateWishlist(movie: Movie) {
    const orgState = this.organizationQuery.getValue().org;
    const pendingWishlist = this.organizationQuery
      .getValue()
      .org.wishlist.filter(wishlist => wishlist.status === 'pending');
    const wishlistFactory = (movieId: string): WishlistWithDates => {
      return {
        status: WishlistStatus.pending,
        movieIds: [movieId]
      };
    };
    if (!orgState.wishlist || orgState.wishlist.length <= 0) {
      this.organizationService.update({ ...orgState, wishlist: [wishlistFactory(movie.id)] });
    } else if (pendingWishlist.length) {
      const wishlist = orgState.wishlist.map(w => {
        const wish = Object.assign({}, w);
        if (wish.status === 'pending') {
          wish.movieIds.includes(movie.id)
            ? (wish.movieIds = wish.movieIds.filter(id => id !== movie.id))
            : (wish.movieIds = [...wish.movieIds, movie.id]);
        }
        return wish;
      });
      this.organizationService.update({ ...orgState, wishlist: wishlist });
    }
  }

  public removeDistributionRight(rightId: string, basketId: string) {
    const findDistributionRight: DistributionRight[] = [];
    this.basketQuery.getAll().forEach(baskets =>
      baskets.rights.forEach(right => {
        if (right.id === rightId) {
          findDistributionRight.push(right);
        }
      })
    );
    // if there is only one distribution right in the basket, delete the basket
    if (findDistributionRight.length <= 1) {
      this.db.doc<CatalogBasket>(`orgs/${this.organizationQuery.id}/baskets/${basketId}`).delete();
    } else {
      this.basketQuery.getAll().forEach(baskets =>
        baskets.rights.forEach(right => {
          if (right.id !== rightId) {
            this.db
              .doc<CatalogBasket>(`orgs/${this.organizationQuery.id}/baskets/${basketId}`)
              .update(baskets);
          }
        })
      );
    }
  }

  public rewriteBasket(basket: CatalogBasket) {
    this.db
      .doc<CatalogBasket>(`orgs/${this.organizationQuery.id}/baskets/${basket.id}`)
      .update(basket);
  }

  get createFireStoreId(): string {
    return this.db.createId();
  }

  public async removeMovieFromWishlist(id: string): Promise<boolean | Error> {
    try {
      const updatedWishlist = this.organizationQuery
        .getValue()
        .org.wishlist.filter(entity => entity.id !== id);
      await this.db
        .collection('orgs')
        .doc(`${this.organizationQuery.id}`)
        .update({ ...this.organizationQuery.getValue().org, wishlist: updatedWishlist });
      return true;
    } catch (err) {
      return err;
    }
  }
}
