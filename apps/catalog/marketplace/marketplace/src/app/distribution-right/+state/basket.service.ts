import { getLabelByCode } from '@blockframes/movie/movie/static-model/staticModels';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { BasketQuery } from './basket.query';
import { Injectable } from '@angular/core';
import { CatalogBasket, createBasket, DistributionRight } from './basket.model';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { BasketState, BasketStore } from './basket.store';
import { SubcollectionService, CollectionConfig, syncQuery, Query } from 'akita-ng-fire';
import { WishlistStatus, WishlistDocument } from '@blockframes/organization/types';

const basketsQuery = (organizationId: string): Query<CatalogBasket> => ({
  path: `orgs/${organizationId}/baskets`,
  queryFn: ref => ref.where('status', '==', 'pending')
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'orgs/:orgId/baskets' })
export class BasketService extends SubcollectionService<BasketState> {
  syncQuery = syncQuery.bind(this, basketsQuery(this.organizationQuery.getValue().org.id));

  constructor(
    private organizationQuery: OrganizationQuery,
    private basketQuery: BasketQuery,
    store: BasketStore
  ) {
    super(store);
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
    const wishlistFactory = (): WishlistDocument => {
      return {
        id: this.db.createId(),
        status: WishlistStatus.pending,
        movieIds: [movie.id]
      };
    };
    // Unwrap the present, cause it can only be one org
    const orgState: Organization = this.organizationQuery.getValue().org;
    if (!orgState.wishlist) {
      this.db
        .collection('orgs')
        .doc(`${this.organizationQuery.id}`)
        .set({ ...orgState, wishlist: [wishlistFactory()] });
    } else if (orgState.wishlist.length >= 0) {
      /* There are already movies in the wishlist,
       * now ne need to look if the movie is already added
       */
      const movieAlreadyExists = []
      orgState.wishlist.forEach(wishlist => {
        wishlist.movieIds.forEach(id => {
          if (id === movie.id) {
            movieAlreadyExists.push(id)
          }
        });
      });
      console.log(movieAlreadyExists);
      if (movieAlreadyExists.length > 0) {
        // It already exists, so delet it
        const updatedWishlist = [];
        orgState.wishlist.forEach(wishlist => {
          wishlist.movieIds.forEach(id => {
            if (id !== movie.id) {
              updatedWishlist.push(wishlist);
              console.log(wishlist);
            }
          });
        });
        this.db
          .collection('orgs')
          .doc(`${this.organizationQuery.id}`)
          .update({ wishlist: updatedWishlist });
      } else {
        const wishlistWithNewMovie = [];
        orgState.wishlist.forEach(wishlist => {
          wishlist.movieIds.forEach(id => {
            if (id !== movie.id) {
              wishlistWithNewMovie.push(wishlist);
              console.log(wishlist);
            }
          });
        });
        this.db
          .collection('orgs')
          .doc(`${this.organizationQuery.id}`)
          .update({ wishlist: wishlistWithNewMovie });
      }
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
}
