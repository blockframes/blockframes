import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { DistributionRight } from '@blockframes/distribution-rights/+state';
import { Movie } from '@blockframes/movie/+state/movie.model';

export interface TitleCart {
  movieId: string;
  movie?: Movie;
  rights: DistributionRight[];
}

export interface MarketplaceState extends EntityState<TitleCart> {
  wishlist: string[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'marketplace', idKey: 'movieId' })
export class MarketplaceStore extends EntityStore<MarketplaceState> {
  constructor() {
    super();
  }

  addToWishlist(movieId: string) {
    this.update(state => ({ wishlist: [...state.wishlist, movieId ]}));
  }

  removeFromWishlist(movieId: string) {
    this.update(state => ({ wishlist: state.wishlist.filter(id => id !== movieId )}));
  }

  /** Set an empty title cart. */
  addTitle(movieId: string) {
    this.add({movieId, rights: []})
  }
}
