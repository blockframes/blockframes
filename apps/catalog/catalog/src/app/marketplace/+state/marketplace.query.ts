import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MarketplaceState, MarketplaceStore } from './marketplace.store';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Movie } from '@blockframes/movie/+state/movie.model';

@Injectable({ providedIn: 'root' })
export class MarketplaceQuery extends QueryEntity<MarketplaceState> {
  constructor(protected store: MarketplaceStore, private movieQuery: MovieQuery) {
    super(store);
  }

  /** The list of titles in the wishlist */
  wishlist$: Observable<Movie[]> = this.select('wishlist').pipe(
    switchMap(movieIds => this.movieQuery.selectMany(movieIds))
  )

  /** Check if a title is in the wishlist */
  isInWishlist(movieId: string) {
    return this.select('wishlist').pipe(
      map(wishlist => wishlist.includes(movieId))
    );
  }

  /** Get the deals from a specific title in the cart */
  getTitleDeals(titleId: string) {
    const titleCart = this.getEntity(titleId)
    return (!!titleCart) ? titleCart.deals : [];
  }

}
