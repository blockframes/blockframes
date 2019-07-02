import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { RightsStore, RightsState } from './rights.store';
import { AuthQuery } from '@blockframes/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RightsQuery extends Query<RightsState> {
  constructor(
    protected store: RightsStore,
    private auth: AuthQuery
  ) {
    super(store);
  }

  /** Checks if the connected user is the Super Admin of his organization */
  public get isSuperAdmin$(): Observable<boolean> {
    return this.select(state => state.superAdmins.includes(this.auth.userId));
  }
}
