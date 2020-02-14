import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig, Store } from '@datorama/akita';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state';


export interface MarketplaceState extends EntityState<DistributionDeal[]> {
  wishlist: string[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'marketplace' })
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
