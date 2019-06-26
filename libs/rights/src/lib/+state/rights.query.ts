import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationRights } from './rights.model';
import { RightsState, RightsStore } from './rights.store';
import { AuthQuery } from '@blockframes/auth';
import { map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RightsQuery extends QueryEntity<RightsState, OrganizationRights> {
  constructor(
    protected store: RightsStore,
    private auth: AuthQuery
  ) {
    super(store);
  }

  /** Checks if the connected user is the Super Admin of his organization */
  public get isSuperAdmin$(): Observable<boolean> {
    return this.selectActive().pipe(
      map(({ superAdmin }) => superAdmin === this.auth.userId)
    )
  }
}
