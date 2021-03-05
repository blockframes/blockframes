import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Movie } from '@blockframes/movie/+state/movie.model';

export interface TitleCart {
  movieId: string;
  movie?: Movie;
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

  /** Set an empty title cart. */
  addTitle(movieId: string) {
    this.add({movieId})
  }
}
