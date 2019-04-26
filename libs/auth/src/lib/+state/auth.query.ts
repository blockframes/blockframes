import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { AuthStore, AuthState } from './auth.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthQuery extends Query<AuthState> {

  public isLogged$ = this.select(state => state.user).pipe(map(user => !!user));
  public user$ = this.select(state => state.user);
  public encrytping$ = this.select(state => state.isEncrypting);

  constructor(private afAuth: AngularFireAuth, protected store: AuthStore) {
    super(store);
  }

  get user() {
    return this.getValue().user;
  }

  get requestedRoute() {
    return this.getValue().requestedRoute;
  }

}
