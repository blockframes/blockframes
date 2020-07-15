import { Injectable } from '@angular/core';
import { AuthQuery, User, AuthService, AuthState } from '../+state';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

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

  sync(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.afAuth.authState.pipe(
      switchMap(userAuth => {
        if (!userAuth) {
          // Set the value of redirectTo
          localStorage.setItem('redirectTo', state.url);
          return this.router.navigate(['/']);
        }
        return this.service.sync().pipe(
          catchError(() => this.router.navigate(['/'])),
          map(_ => this.query.user),
          map(user => (hasIdentity(user)) ? true : 'auth/identity'),
        );
      })
    );
  }
}
