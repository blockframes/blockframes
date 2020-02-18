import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { MovieQuery, Movie } from '@blockframes/movie';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MarketplaceState, MarketplaceStore, TitleCart } from './marketplace.store';

@Injectable({ providedIn: 'root' })
export class MarketplaceQuery extends QueryEntity<MarketplaceState> {
  constructor(protected store: MarketplaceStore, private movieQuery: MovieQuery) {
    super(store);
  }

  /** The list of titles in the wishlist */
  wishlist$: Observable<Movie[]> = this.select('wishlist').pipe(
    switchMap(movieIds => this.movieQuery.selectMany(movieIds))
  )

  /** Check if a titl is in the wishlist */
  isInWishlist(movieId: string) {
    return this.select('wishlist').pipe(
      map(wishlist => wishlist.includes(movieId))
    );
  }

}
