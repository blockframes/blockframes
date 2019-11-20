import { Injectable } from '@angular/core';
import { AuthQuery, User, AuthService, AuthState, AuthStore } from '../+state';
import { map } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';

// Verify if the user exists and has a name and surname.
function hasIdentity(user: User) {
  return !!user && !!user.name && !!user.surname;
}

@Injectable({
  providedIn: 'root'
})
@CollectionGuardConfig({ awaitSync: true })
export class AuthGuard extends CollectionGuard<AuthState> {
  constructor(
    service: AuthService,
    private query: AuthQuery,
    private store: AuthStore
  ) {
    super(service);
  }

  sync() {
    return this.service.sync().pipe(
      map(_ => this.query.user),
      map(user => {
        if (!user) {
          return 'auth';
        };
        this.store.update({  auth: { emailVerified: this.service.user.emailVerified } });
        return hasIdentity(user) ? true : 'auth/identity';
      })
    );
  }
}
