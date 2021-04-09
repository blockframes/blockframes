import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import { Organization } from './organization.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {
  constructor(protected store: OrganizationStore) {
    super(store);
  }

  //////////////////
  /// WISHLIST STUFF
  //////////////////


  /** Checks if a movie is or is not in the organization wishlist. */
  public isAddedToWishlist(movieId: string): Observable<boolean> {
    return this.selectActive().pipe(
      map(org => org.wishlist.includes(movieId))
    );
  }
}
