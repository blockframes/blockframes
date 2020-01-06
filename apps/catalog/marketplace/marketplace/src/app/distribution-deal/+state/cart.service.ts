import { Movie, DistributionDeal } from '@blockframes/movie/movie/+state/movie.model';
import { Injectable } from '@angular/core';
import { CatalogCart, createCart, CartStatus } from './cart.model';
import { OrganizationQuery, OrganizationService, Wishlist } from '@blockframes/organization';
import { CartState, CartStore } from './cart.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { WishlistStatus } from '@blockframes/organization';
import { AuthQuery } from '@blockframes/auth';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MovieCurrenciesSlug } from '@blockframes/movie/movie/static-model/types';
import { MovieService } from '@blockframes/movie/movie/+state/movie.service';

const wishlistFactory = (movieId: string): Wishlist => {
  return {
    status: WishlistStatus.pending,
    movieIds: [movieId]
  };
};

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs/:orgId/carts' })
export class CartService extends CollectionService<CartState> {

  constructor(
    private organizationQuery: OrganizationQuery,
    private organizationService: OrganizationService,
    private authQuery: AuthQuery,
    private functions: AngularFireFunctions,
    protected store: CartStore,
    private movieService: MovieService,
  ) {
    super(store);
  }

  //////////////////
  /// CART STUFF
  //////////////////

  /**
   * Adds a deal to cart identified by "name" (default cart name is : "default")
   * @param dealId
   * @param name
   */
  // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
  public async addDealToCart(dealId: string, name: string): Promise<CatalogCart> {
    const cart = await this.getCart(name);
    cart.deals.push(dealId);
    return this.updateCart(cart);
  }

  /**
   * Change cart status to : "submitted".
   * @param amount
   * @param currency
   * @param name
   */
  // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
  public async submitCart(amount: number, currency: MovieCurrenciesSlug, name: string = 'default') {
    const cart = await this.getCart(name);
    const updatedCart: CatalogCart = {
      ...cart,
      price: { amount, currency },
      status: CartStatus.submitted
    };
    this.updateCart(updatedCart);
  }

  /**
   * Creates an empty cart
   * @param name
   */
  // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
  private async initCart(name: string = 'default'): Promise<CatalogCart> {
    const cart: CatalogCart = createCart({ name });
    await this.db.doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/carts/${name}`).set(cart);
    return cart;
  }

  /**
   *
   * @param cart
   */
  // @TODO #1389 Remove this function if doesn't do anything more than native akita-ng-fire
  private async updateCart(cart: CatalogCart): Promise<CatalogCart> {
    await this.db
      .doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/carts/${cart.name}`)
      .update(cart);
    return cart;
  }

  /**
   * Performs a collection group query accross movies to retreive sales
   * @param type  licensee | licensor
   */
  // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
  public async getMyDeals(type: string = 'licensor'): Promise<DistributionDeal[]> {
    const query = this.db.collectionGroup('distributiondeals', ref => ref.where(`${type}.orgId`, '==', this.organizationQuery.getActiveId()))
    const myDeals = await query.get().toPromise();
    return myDeals.docs.map(doc => this.movieService.formatDistributionDeal(doc.data()));
  }

  /**
   * Returns cart for given name if exists or create new one
   * @param name
   */
  // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
  public async getCart(name: string = 'default'): Promise<CatalogCart> {
    const snap = await this.db.doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/carts/${name}`).ref.get();
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

  /**
   * Update the status of the wishlist to 'sent' and create new date at this moment.
   * @param movies
   */
  // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
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

  /**
   *
   * @param movieId
   */
  // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
  public async removeMovieFromWishlist(movieId: string): Promise<boolean | Error> {
    const orgState = this.organizationQuery.getActive();
    try {
      const wishlist = orgState.wishlist.map(wish => {
        if (wish.status === 'pending') {
          const movieIds = wish.movieIds.includes(movieId) ? wish.movieIds.filter(id => id !== movieId) : wish.movieIds;
          return { ...wish, movieIds };
        } else {
          return wish;
        }
      });
      await this.organizationService.update({ ...orgState, wishlist });
      return true;
    } catch (err) {
      return err;
    }
  }

  /**
   *
   * @param movie
   */
  public async updateWishlist(movie: Movie) {
    const orgState = this.organizationQuery.getActive();
    const pendingWishlist = this.organizationQuery
      .getActive()
      .wishlist.filter(wishlist => wishlist.status === 'pending');

    if (!orgState.wishlist || orgState.wishlist.length <= 0) {
      console.log({ wishlist: [wishlistFactory(movie.id)] });
      this.organizationService.update({ ...orgState, wishlist: [wishlistFactory(movie.id)] });
      // If the organization has sent wishlist but no pending
    } else if (pendingWishlist.length === 0) {
      this.organizationService.update({ ...orgState, wishlist: [...orgState.wishlist, wishlistFactory(movie.id)] });
    } else {
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
      this.organizationService.update({ ...orgState, wishlist });
    }
  }
}
