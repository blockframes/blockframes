import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
  RouterStateSnapshot
} from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthQuery, AuthStore, AuthService } from '../+state';
import { Observable, of } from 'rxjs';
import { map, switchMap, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private afAuth: AngularFireAuth,
    private store: AuthStore,
    private query: AuthQuery,
    private service: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean | UrlTree> {
    this.store.update({ requestedRoute: null });
    // Connected on the app
    if (!!this.query.user) return true;
    // Wait for the server to give first answer
    return this.afAuth.authState.pipe(
      switchMap(auth => {
        if (auth) {
          // Connected on Firebase
          this.service.subscribeOnUser();
          return this.query.user$.pipe(
            map(user => !!user),
            filter(hasUser => hasUser)
          );
        } else {
          // Not connected
          this.store.update({ requestedRoute: state.url });
          return of(this.router.parseUrl('/auth'));
        }
      })
    );
  }
}
