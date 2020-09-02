import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { CartStore, CartState } from './cart.store';
import { CatalogCart } from './cart.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MovieService } from '@blockframes/movie/+state/movie.service';

@Injectable({ providedIn: 'root' })
export class CatalogCartQuery extends QueryEntity<CartState, CatalogCart> {
  constructor(protected store: CartStore, private organizationQuery: OrganizationQuery) {
    super(store);
  }

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
