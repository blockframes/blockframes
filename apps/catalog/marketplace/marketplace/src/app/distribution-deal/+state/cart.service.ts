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
   * Adds a deal to cart identified by "name"
   * @param dealId 
   * @param name 
   */
  public async addDealToCart(dealId: string, name: string): Promise<CatalogCart> {
    const cart = await this.getCart(name);
    cart.deals.push(dealId);
    return this.updateCart(cart);
  }

  /**
   * 
   * @param amount 
   * @param currency
   * @param _name
   */
  public async submitCart(amount: number, currency: MovieCurrenciesSlug, _name?: string) {
    const name = _name ? _name : 'default';
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
   * @param _name
   */
  private async initCart(_name?: string): Promise<CatalogCart> {
    const name = _name ? _name : 'default';
    const cart: CatalogCart = createCart({ name });
    await this.db.doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/cart/${name}`).set(cart);
    return cart;
  }

  private async updateCart(cart: CatalogCart): Promise<CatalogCart> {
    await this.db
      .doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/cart/${cart.name}`)
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
   * @param id 
   */
  // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
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

  /**
   * 
   * @param movie 
   */
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
