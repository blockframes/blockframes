import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, UrlTree, RouterStateSnapshot } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthQuery, AuthStore, AuthService } from '../+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CloseProtection } from './close-protection';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanDeactivate<CloseProtection> {
  constructor(
    private afAuth: AngularFireAuth,
    private store: AuthStore,
    private query: AuthQuery,
    private service: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean | UrlTree> {
    this.store.update({ requestedRoute: null })
    // Connected on the app
    if (!!this.query.user) return true;
    // Wait for the server to give first answer
    return this.afAuth.authState.pipe(
      map(auth => {
        if (auth) { // Connected on Firebase
          this.service.subscribeOnUser();
          return true;
        } else {    // Not connected
          this.store.update({ requestedRoute: state.url })
          return this.router.parseUrl('/auth')
        }
      })
    );
  }

  canDeactivate(
    component: CloseProtection,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return component.isFlaged();
  }
}
