import { map } from 'rxjs/operators';
import { Movie, DistributionDeal } from '@blockframes/movie/movie/+state/movie.model';
import { CartQuery } from './cart.query';
import { Injectable } from '@angular/core';
import { CatalogCart, createCart } from './cart.model';
import { OrganizationQuery, OrganizationService, Wishlist } from '@blockframes/organization';
import { CartState, CartStore } from './cart.store';
import { CollectionConfig, syncQuery, Query, CollectionService } from 'akita-ng-fire';
import { WishlistStatus } from '@blockframes/organization';
import { AuthQuery } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/functions';

const cartsQuery = (organizationId: string): Query<CatalogCart> => ({
  path: `orgs/${organizationId}/cart`,
  queryFn: ref => ref.where('status', '==', 'pending')
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs/:orgId/baskets' })
export class CartService extends CollectionService<CartState> {
  syncQuery = syncQuery.bind(this, cartsQuery(this.organizationQuery.getActiveId()));

  constructor(
    private organizationQuery: OrganizationQuery,
    private cartQuery: CartQuery,
    private organizationService: OrganizationService,
    private authQuery: AuthQuery,
    private functions: AngularFireFunctions,
    protected store: CartStore
  ) {
    super(store);
  }

  //////////////////
  /// CART STUFF
  //////////////////

  /**
   * Adds a deal to cart identified by "name"
   * @param deal 
   * @param name 
   */
  public async addDealToCart(dealId: string, name: string): Promise<CatalogCart> {
    const cart = await this.getCart(name);
    cart.deals.push(dealId);
    return this.updateCart(cart);
  }

  // TODO #1061 rework
  public removeDistributionRight(rightId: string, basketId: string) {
    /*const findDistributionRight: DistributionRight[] = [];
    this.cartQuery.getAll().forEach(baskets =>
      baskets.deals.forEach(right => {
        if (right.id === rightId) {
          findDistributionRight.push(right);
        }
      })
    );
    // if there is only one distribution right in the basket, delete the basket
    if (findDistributionRight.length <= 1) {
      this.db.doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/cart/${basketId}`).delete();
    } else {
      this.cartQuery.getAll().forEach(baskets =>
        baskets.deals.forEach(right => {
          if (right.id !== rightId) {
            this.db
              .doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/cart/${basketId}`)
              .update(baskets);
          }
        })
      );
    }*/
  }

  /**
   * Creates an empty cart
   * @param _name
   */
  private async initCart(_name?: string): Promise<CatalogCart> {
    const name = _name ? _name : 'default';
    const cart: CatalogCart = createCart({ name });
    await this.db.doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/cart/${name}`).set(cart);
    return cart;
  }

  public async updateCart(cart: CatalogCart): Promise<CatalogCart> { // @todo #1061 private when cleaned setPriceCurrency()
    await this.db
      .doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/cart/${cart.name}`)
      .update(cart);

    return cart;
  }

  /**
   * Performs a collection group query accross movies to retreive sales
   * @param type  licensee | licensor
   */
  public async getMyDeals(type: string = 'licensor'): Promise<DistributionDeal[]> {
    const query = this.db.collectionGroup('distributiondeals', ref => ref.where(`${type}.orgId`, '==', this.organizationQuery.getActiveId())) // @todo #1061 => publicdistributiondeals
    const myDeals = await query.get().toPromise();
    return myDeals.docs.map(doc => doc.data() as DistributionDeal); // @TODO #1061 transform timestamps
  }


  /**
   * Returns cart for given name if exists or create new one
   * @param name 
   */
  public async getCart(name: string): Promise<CatalogCart> {
    const snap = await this.db.doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/cart/${name}`).ref.get();
    const cart = snap.data() as CatalogCart;
    if (cart === undefined) {
      return this.initCart(name);
    } else {
      return cart;
    }
  }

  //////////////////
  /// WISHLIST STUFF
  //////////////////

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

  /** Update the status of the wishlist to 'sent' and create new date at this moment. */
  public async updateWishlistStatus(movies: Movie[]) {
    const user = this.authQuery.user;
    const org = this.organizationQuery.getActive();
    const wishlistTitles = movies.map(movie => movie.main.title.original);

    const callDeploy = this.functions.httpsCallable('sendWishlistEmails');
    await callDeploy({ email: user.email, userName: user.name, orgName: org.name, wishlist: wishlistTitles }).toPromise();

    const setSent = (wishlist: Wishlist) => {
      return wishlist.status === WishlistStatus.pending
        ? { ...wishlist, status: WishlistStatus.sent, sent: new Date() }
        : wishlist
    }

    return this.organizationService.update({ ...org, wishlist: org.wishlist.map(wishlist => setSent(wishlist)) });
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
}
