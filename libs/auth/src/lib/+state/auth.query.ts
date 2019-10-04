import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AuthStore, AuthState } from './auth.store';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthQuery extends Query<AuthState> {
  public isLogged$ = this.select(state => state.user).pipe(map(user => !!user));
  public user$ = this.select(state => state.user);
  public hasVerifiedEmail$ = this.select(state => state.auth && state.auth.emailVerified);

  constructor(protected store: AuthStore) {
    super(store);
  }

  get user() {
    return this.getValue().user;
  }

  get userId() {
    return this.user.uid;
  }

  get orgId() {
    return this.user.orgId;
  }

  get requestedRoute() {
    return this.getValue().requestedRoute;
  }
}
