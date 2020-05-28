import { Injectable } from '@angular/core';
import { AuthQuery, User, AuthService, AuthState } from '../+state';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';

// Verify if the user exists and has a name and surname.
function hasIdentity(user: User) {
  return !!user && !!user.firstName && !!user.lastName;
}

@Injectable({
  providedIn: 'root'
})
@CollectionGuardConfig({ awaitSync: true })
export class AuthGuard extends CollectionGuard<AuthState> {
  constructor(service: AuthService, private query: AuthQuery, private afAuth: AngularFireAuth) {
    super(service);
  }

  sync() {
    return this.afAuth.authState.pipe(
      switchMap(userAuth => {
        if (!userAuth) {
          return this.router.navigate(['/']);
        }
        return this.service.sync().pipe(
          catchError(() => this.router.navigate(['/'])),
          map(_ => this.query.user),
          map(user => (hasIdentity(user) ? true : 'auth/identity'))
        );
      })
    );
  }
}
