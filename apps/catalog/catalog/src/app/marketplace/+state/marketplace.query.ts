import { Injectable } from '@angular/core';
import { Query, QueryEntity } from '@datorama/akita';
import { MovieQuery, Movie } from '@blockframes/movie';
import { Wishlist } from '@blockframes/organization';
import { Observable, combineLatest } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';
import { MarketplaceState, MarketplaceStore } from './marketplace.store';

@Injectable({ providedIn: 'root' })
export class CatalogCartQuery extends QueryEntity<MarketplaceState> {
  constructor(protected store: MarketplaceStore, private movieQuery: MovieQuery) {
    super(store);
  }

  /** The list of titles in the wishlist */
  wishlist$: Observable<Movie[]> = this.select('wishlist').pipe(
    switchMap(movieIds => this.movieQuery.selectMany(movieIds))
  )

  /** The list of titles in the cart filled with distribution deals */
  cart$: Observable<Movie[]> = this.select('ids').pipe(
    switchMap(movieIds => this.movieQuery.selectMany(movieIds)),
    switchMap(movies => {
      const movies$ = movies.map(movie => {
        return this.selectEntity(movie.id).pipe(
          map(distributionDeals => ({ ...movie, distributionDeals }))
        );
      });
      return combineLatest(movies$);
    })
  )
}
