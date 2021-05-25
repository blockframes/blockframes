import { Injectable } from '@angular/core';
import { AuthQuery, AuthService, AuthState } from '../+state';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { hasDisplayName } from '@blockframes/utils/helpers';

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
          map(() => this.query.user),
          map(user => (hasDisplayName(user)) ? true : 'auth/identity'),
        );
      })
    );
  }
}
