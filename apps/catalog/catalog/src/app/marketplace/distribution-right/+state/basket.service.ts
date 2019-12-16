import { switchMap, map } from 'rxjs/operators';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { BasketQuery } from './basket.query';
import { Injectable } from '@angular/core';
import { CatalogBasket, createBasket, DistributionRight } from './basket.model';
import { OrganizationQuery, OrganizationService, Wishlist } from '@blockframes/organization';
import { BasketState, BasketStore } from './basket.store';
import { CollectionConfig, syncQuery, Query, CollectionService } from 'akita-ng-fire';
import { WishlistStatus } from '@blockframes/organization';
import { AuthQuery } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/functions';

const basketsQuery = (organizationId: string): Query<CatalogBasket> => ({
  path: `orgs/${organizationId}/baskets`,
  queryFn: ref => ref.where('status', '==', 'pending')
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs/:orgId/baskets' })
export class BasketService extends CollectionService<BasketState> {
  syncQuery = syncQuery.bind(this, basketsQuery(this.organizationQuery.getActiveId()));

  constructor(
    private organizationQuery: OrganizationQuery,
    private basketQuery: BasketQuery,
    private organizationService: OrganizationService,
    private authQuery: AuthQuery,
    private functions: AngularFireFunctions,
    store: BasketStore
  ) {
    super(store);
  }

  /** Update the status of the wishlist to 'sent' and create new date at this moment. */
  public async updateWishlistStatus(movies: Movie[]) {
    const user = this.authQuery.user;
    const org = this.organizationQuery.getActive();
    const wishlistTitles = movies.map(movie => movie.main.title.original);

    const callDeploy = this.functions.httpsCallable('sendWishlistEmails');
    await callDeploy({ email: user.email, userName: user.name, orgName: org.denomination.full, wishlist: wishlistTitles }).toPromise();

    const setSent = (wishlist: Wishlist) => {
      return wishlist.status === WishlistStatus.pending
        ?  {...wishlist, status: WishlistStatus.sent, sent: new Date()}
        : wishlist
    }

    return this.organizationService.update({...org, wishlist: org.wishlist.map(wishlist => setSent(wishlist))});
  }

  public addBasket(basket: CatalogBasket) {
    const id = this.db.createId();
    const newBasket: CatalogBasket = createBasket({
      id,
      price: { amount: 0, currency: 'euro' },
      rights: basket.rights
    });
    this.db.doc<CatalogBasket>(`orgs/${this.organizationQuery.getActiveId()}/baskets/${id}`).set(newBasket);
  }

  public async updateWishlist(movie: Movie) {
    const orgState = this.organizationQuery.getActive();
    const pendingWishlist = this.organizationQuery
      .getActive()
      .wishlist.filter(wishlist => wishlist.status === 'pending');
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
          if (wish.movieIds.includes(movie.id)) {
            wish.movieIds = wish.movieIds.filter(id => id !== movie.id);
          } else {
            wish.movieIds = [...wish.movieIds, movie.id];
          }
        }
        return wish;
      });
      this.organizationService.update({ ...orgState, wishlist: wishlist });
    }
  }

  /** Checks if a movie is or is not in the organization wishlist. */
  public isAddedToWishlist(movieId: string): Observable<boolean> {
    return this.organizationQuery.selectActive().pipe(
      map(org => {
        return org.wishlist
          .filter(({ status }) => status === 'pending')
          .some(({ movieIds }) => movieIds.includes(movieId))
      })
    );
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
      this.db.doc<CatalogBasket>(`orgs/${this.organizationQuery.getActiveId()}/baskets/${basketId}`).delete();
    } else {
      this.basketQuery.getAll().forEach(baskets =>
        baskets.rights.forEach(right => {
          if (right.id !== rightId) {
            this.db
              .doc<CatalogBasket>(`orgs/${this.organizationQuery.getActiveId()}/baskets/${basketId}`)
              .update(baskets);
          }
        })
      );
    }
  }

  public rewriteBasket(basket: CatalogBasket) {
    this.db
      .doc<CatalogBasket>(`orgs/${this.organizationQuery.getActiveId()}/baskets/${basket.id}`)
      .update(basket);
  }

  get createFireStoreId(): string {
    return this.db.createId();
  }

  public removeMovieFromWishlist(id: string): boolean | Error {
    try {
      const wishlist = this.organizationQuery.getActive().wishlist.map(w => {
        const wish = Object.assign({}, w);
        if (wish.status === 'pending' && wish.movieIds.includes(id)) {
          wish.movieIds = wish.movieIds.filter(movieId => movieId !== id);
        }
        return wish;
      });
      this.organizationService.update({
        ...this.organizationQuery.getActive(),
        wishlist: wishlist
      });
      return true;
    } catch (err) {
      return err;
    }
  }
}
