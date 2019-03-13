import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AuthStore, AuthState } from './auth.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthQuery extends Query<AuthState> {
  constructor(protected store: AuthStore) {
    super(store);
  }

  get isLogged$() {
    return this.select(state => state.user).pipe(map(user => !!user));
  }

  // @deprecated use user$ to get an observable
  get user() {
    return this.getValue().user;
  }

  public user$(): Observable<any> {
    return this.select(state => state.user);
  }
}
