import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { BasketStore, BasketState } from './basket.store';
import { CatalogBasket } from './basket.model';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery, Wishlist } from '@blockframes/organization';
import { Observable, combineLatest } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BasketQuery extends QueryEntity<BasketState, CatalogBasket> {
  constructor(protected store: BasketStore, private movieQuery: MovieQuery, private organizationQuery: OrganizationQuery) {
    super(store);
  }

  /** Return an observable of a WishList array containing the movies */
  public wishlistWithMovies$: Observable<Wishlist[]> = combineLatest([
    this.organizationQuery.selectActive(),
    this.movieQuery.selectAll()
  ]).pipe(
    filter(([org, movies]) => !!org),
    map(([org, movies]) => {
      return org.wishlist.map(wish => {
        const wishMovies = wish.movieIds.map(id => movies.find(movie => movie.id === id));
        return { ...wish, movies: wishMovies };
      })
    })
  );
}
