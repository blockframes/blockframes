import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { CartStore, CartState } from './cart.store';
import { CatalogCart } from './cart.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Observable, combineLatest } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { Wishlist } from '@blockframes/organization/+state/organization.model';

@Injectable({ providedIn: 'root' })
export class CatalogCartQuery extends QueryEntity<CartState, CatalogCart> {
  constructor(protected store: CartStore, private movieQuery: MovieQuery, private organizationQuery: OrganizationQuery) {
    super(store);
  }

  //////////////////
  /// WISHLIST STUFF
  //////////////////

  /**
   * @dev Return an observable of a WishList array containing the movies
   */
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
