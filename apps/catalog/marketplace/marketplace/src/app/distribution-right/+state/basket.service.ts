import { switchMap } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { BasketQuery } from './basket.query';
import { Injectable } from '@angular/core';
import { CatalogBasket, createBasket, DistributionRight } from './basket.model';
import { OrganizationQuery, OrganizationService, Wishlist } from '@blockframes/organization';
import { BasketState, BasketStore } from './basket.store';
import { CollectionConfig, syncQuery, Query, CollectionService } from 'akita-ng-fire';
import { WishlistStatus } from '@blockframes/organization';
import { AuthQuery } from '@blockframes/auth';

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
    store: BasketStore,
    private authQuery: AuthQuery
  ) {
    super(store);
  }

  public syncBasket() {
    return this.organizationQuery
      .select('org')
      .pipe(switchMap(({ id }) => this.syncCollection({ pathParams: { orgId: id } })));
  }

  /** Update the status of the wishlist to 'sent' and create new date at this moment. */
  public updateWishlistStatus(movies: Movie[]) {
    // Argument movies will be used to send emails => issue#1102
    // Const user will be used to send emails => issue#1102
    const user = this.authQuery.user;
    const org = this.organizationQuery.getValue().org;

    const setSent = (wishlist: Wishlist) => {
      return wishlist.status === WishlistStatus.pending
        ?  {...wishlist, status: WishlistStatus.sent, sent: new Date()}
        : wishlist
    }

    return this.organizationService.update({...org, wishlist: org.wishlist.map(wishlist => setSent(wishlist))});
    // TODO: issue #1111 and #1102, send an email to the user and Cascade8 with list of movies
    // Use variables: movies, org and user
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
    const wishlistFactory = (movieId: string): Wishlist => {
      return {
        status: WishlistStatus.pending,
        movieIds: [movieId]
      };
    };
    if (!orgState.wishlist || orgState.wishlist.length <= 0) {
      this.organizationService.update({ ...orgState, wishlist: [wishlistFactory(movie.id)] });
      // If the organization has sent wishlist but no pending
    } else if (pendingWishlist.length === 0) {
      this.organizationService.update({ ...orgState, wishlist: [...orgState.wishlist, wishlistFactory(movie.id)] });
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

  public removeMovieFromWishlist(id: string): boolean | Error {
    try {
      const wishlist = this.organizationQuery.getValue().org.wishlist.map(w => {
        const wish = Object.assign({}, w);
        if (wish.status === 'pending' && wish.movieIds.includes(id)) {
          wish.movieIds = wish.movieIds.filter(movieId => movieId !== id);
        }
        return wish;
      });
      this.organizationService.update({
        ...this.organizationQuery.getValue().org,
        wishlist: wishlist
      });
      return true;
    } catch (err) {
      return err;
    }
  }
}
