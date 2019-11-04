import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { BasketStore, BasketState } from './basket.store';
import { CatalogBasket } from './basket.model';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery, Wishlist } from '@blockframes/organization';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BasketQuery extends QueryEntity<BasketState, CatalogBasket> {
  constructor(protected store: BasketStore, private movieQuery: MovieQuery, private organizationQuery: OrganizationQuery) {
    super(store);
  }

  /** Return an observable of a WishList array containing the movies */
  public wishlistsWithMovies$: Observable<Wishlist[]> = combineLatest([
    this.organizationQuery.select(state => state.org.wishlist),
    this.movieQuery.selectAll()
  ]).pipe(
    map(([wishlists, movies]) => {
      return wishlists.map(wishlist => {
        const wishlistMovies = wishlist.movieIds.map(id => movies.find(movie => movie.id === id));
        return { ...wishlist, movies: wishlistMovies };
      })
    })
  );
}
