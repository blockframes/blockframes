import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AuthStore, AuthState } from './auth.store';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthQuery extends Query<AuthState> {
  public isLogged$ = this.select(state => state.uid).pipe(map(uid => !!uid));
  public user$ = this.select(state => state.profile);
  public hasVerifiedEmail$ = this.select(state => state.emailVerified);

  constructor(protected store: AuthStore) {
    super(store);
  }

  get user() {
    return this.getValue().profile;
  }

  get userId() {
    return this.getValue().uid;
  }

  get orgId() {
    return this.user.orgId;
  }

  get requestedRoute() {
    return this.getValue().requestedRoute;
  }
}
