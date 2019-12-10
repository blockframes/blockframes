import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { CartStore, CartState } from './cart.store';
import { CatalogCart } from './cart.model';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery, Wishlist } from '@blockframes/organization';
import { Observable, combineLatest } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CatalogCartQuery extends QueryEntity<CartState, CatalogCart> {
  constructor(protected store: CartStore, private movieQuery: MovieQuery, private organizationQuery: OrganizationQuery) {
    super(store);
  }

  /** Return an observable of a WishList array containing the movies */
  public wishlistWithMovies$: Observable<Wishlist[]> = combineLatest([ // @todo(#1061)
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


  //////////////////
  /// WISHLIST STUFF
  //////////////////

  /** Checks if a movie is or is not in the organization wishlist. */
  public isAddedToWishlist(movieId: string): Observable<boolean> {
    return this.organizationQuery.selectActive().pipe(
      map(org => {
        return org.wishlist
          .filter(({ status }) => status === 'pending')
          .some(({ movieIds }) => movieIds.includes(movieId))
      })
    );
  }
}
