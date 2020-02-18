import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state';
import { Movie } from '@blockframes/movie';

export interface TitleCart {
  movieId: string;
  movie?: Movie;
  deals: DistributionDeal[];
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
}
