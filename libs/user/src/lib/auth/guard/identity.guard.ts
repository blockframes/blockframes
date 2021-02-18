import { Injectable } from '@angular/core';
import { AuthQuery, AuthService, AuthState } from '../+state';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { of } from 'rxjs';
import { hasIdentity } from '@blockframes/utils/helpers';

@Injectable({
  providedIn: 'root'
})
@CollectionGuardConfig({ awaitSync: true })
export class IdentityGuard extends CollectionGuard<AuthState> {
  constructor(
    service: AuthService,
    private afAuth: AngularFireAuth,
    private query: AuthQuery, 
  ) {
    super(service);
  }

  sync() {
    return this.afAuth.authState.pipe(
      switchMap(userAuth => {
        if (!userAuth) {
          return of(true);
        };
        return this.service.sync().pipe(
          catchError(() => Promise.resolve(true)),
          map(_ => this.query.user),
          map(user => (hasIdentity(user)) ? '/' : true),
        );
      })
    );
  }
}
