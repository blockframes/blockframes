import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AuthStore, AuthState } from './auth.store';

@Injectable({ providedIn: 'root' })
export class AuthQuery extends Query<AuthState> {
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
    return this.user?.orgId;
  }

  get requestedRoute() {
    return this.getValue().requestedRoute;
  }

  get isBlockframesAdmin() {
    return this.getValue().roles?.blockframesAdmin || false;
  }
}
