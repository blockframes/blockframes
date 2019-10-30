import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { BasketQuery } from './basket.query';
import { Injectable } from '@angular/core';
import { CatalogBasket, createBasket, DistributionRight } from './basket.model';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { BasketState, BasketStore } from './basket.store';
import { SubcollectionService, CollectionConfig, syncQuery, Query } from 'akita-ng-fire';
import { WishlistStatus, WishlistWithDates } from '@blockframes/organization/types';
import clone from 'lodash/clone';
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
      this.db
        .collection('orgs')
        .doc(`${this.organizationQuery.id}`)
        .set({ ...orgState, wishlist: [wishlistFactory(movie.id)] });
    } else if (pendingWishlist) {
      const updatedWishlist = JSON.parse(JSON.stringify(orgState.wishlist));
      for (let i = 0; i < updatedWishlist.length; i++) {
        if (updatedWishlist[i].status === 'pending' && updatedWishlist[i].movieIds.includes(movie.id)) {
          const index = updatedWishlist[i].movieIds.indexOf(movie.id);
          console.log(updatedWishlist[i]);
          updatedWishlist[i].movieIds.splice(index, 1);
          console.log(updatedWishlist[i]);
        } else if (updatedWishlist[i].status === 'pending'){
          updatedWishlist[i].movieIds.push(movie.id)
        }
      }
      this.db
        .collection('orgs')
        .doc(`${this.organizationQuery.id}`)
        .update({ wishlist: updatedWishlist });
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
