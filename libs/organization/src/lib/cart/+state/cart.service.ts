import { Movie } from '@blockframes/movie/+state/movie.model';
import { Injectable } from '@angular/core';
import { CatalogCart, createCart } from './cart.model';
import { CartState, CartStore } from './cart.store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MovieCurrenciesSlug } from '@blockframes/utils/static-model/types';
import { Wishlist } from '@blockframes/organization/+state/organization.model';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';

const wishlistFactory = (movieId: string): Wishlist => {
  return {
    status: 'pending',
    movieIds: [movieId]
  };
};

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs/:orgId/carts' })
export class CartService extends CollectionService<CartState> {

  constructor(
    private organizationQuery: OrganizationQuery,
    private organizationService: OrganizationService,
    private functions: AngularFireFunctions,
    protected store: CartStore
  ) {
    super(store);
  }

  //////////////////
  /// CART STUFF
  // @dev we can replace a lot of these functions by native Akita-ng-fire functions
  // @see https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
  //////////////////

  /**
   * Adds a right to cart identified by "name" (default cart name is : "default")
   * @param rightId
   * @param name
   */
  public async addRightToCart(rightId: string, name: string): Promise<CatalogCart> {
    const cart = await this.getCart(name);
    cart.rights.push(rightId);
    return this.updateCart(cart);
  }

  /**
   * Change cart status to : "submitted".
   * @param amount
   * @param currency
   * @param name
   */
  public async submitCart(amount: number, currency: MovieCurrenciesSlug, name: string = 'default') {
    const cart = await this.getCart(name);
    const updatedCart: CatalogCart = {
      ...cart,
      price: { amount, currency },
      status: 'submitted'
    };
    this.updateCart(updatedCart);
  }

  /**
   * Creates an empty cart
   * @param name
   */
  private async initCart(name: string = 'default'): Promise<CatalogCart> {
    const cart: CatalogCart = createCart({ name });
    await this.db.doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/carts/${name}`).set(cart);
    return cart;
  }

  /**
   *
   * @param cart
   */
  private async updateCart(cart: CatalogCart): Promise<CatalogCart> {
    await this.db
      .doc<CatalogCart>(`orgs/${this.organizationQuery.getActiveId()}/carts/${cart.name}`)
      .update(cart);
    return cart;
  }

  /**
   * Returns cart for given name if exists or create new one
   * @param name
   */
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
  // @dev we can replace a lot of these functions by native Akita-ng-fire functions
  // @see https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
  //////////////////

  /**
   *
   * @param movieId
   */
  public async removeMovieFromWishlist(movieId: string): Promise<boolean | Error> {
    const orgState = this.organizationQuery.getActive();
    try {
      const wishlist = orgState.wishlist.map(wish => {
        if (wish.status === 'pending') {
          return {
            ...wish,
            movieIds: wish.movieIds.filter(id => id !== movieId)
          }
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
