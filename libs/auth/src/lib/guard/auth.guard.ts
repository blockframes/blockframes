import { Injectable } from '@angular/core';
import { AuthQuery, User, AuthService, AuthState } from '../+state';
import { map, switchMap } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { of } from 'rxjs';

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
    private afAuth: AngularFireAuth
  ) {
    super(service);
  }

  sync() {
    return this.afAuth.authState.pipe(
      switchMap(userAuth => {
        if (!userAuth) {
          return of('auth');
        };
        return this.service.sync().pipe(
          map(_ => this.query.user),
          map(user => hasIdentity(user) ? true : 'auth/identity')
        );
      })
    );
  }
}
