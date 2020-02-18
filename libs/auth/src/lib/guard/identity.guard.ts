import { Injectable } from '@angular/core';
import { AuthService, AuthState } from '../+state';
import { switchMap } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
@CollectionGuardConfig({ awaitSync: true })
export class IdentityGuard extends CollectionGuard<AuthState> {
  constructor(
    service: AuthService,
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
        return this.service.sync();
      })
    );
  }
}
