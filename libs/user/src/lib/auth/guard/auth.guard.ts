import { Injectable } from '@angular/core';
import { AuthService } from '../+state';
import { map, catchError, filter, tap } from 'rxjs/operators';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanDeactivate<unknown> {
  private sub: Subscription;
  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.auth$.pipe(
      map((authState) => {
        if (!authState) {
          // Set the value of redirectTo
          localStorage.setItem('redirectTo', state.url);
          return this.router.createUrlTree(['/']);
        }

        return hasDisplayName(authState.profile) ? true : this.router.createUrlTree(['auth/identity']);
      }),
      catchError(() => this.router.navigate(['/'])),
      tap(canActivate => {
        if (canActivate === true) this.redirectOnSignout();
      })
    );
  }

  redirectOnSignout() {
    this.sub = this.authService.user$.pipe(
      filter(user => !user)
    ).subscribe(() => this.router.navigate(['/']));
  }

  canDeactivate() {
    this.sub?.unsubscribe();
    return true;
  }
}
