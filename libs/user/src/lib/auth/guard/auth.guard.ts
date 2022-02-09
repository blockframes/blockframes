import { Injectable } from '@angular/core';
import { AuthService } from '../+state';
import { map, catchError, filter } from 'rxjs/operators';
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

        if (!this.sub) {
          this.sub = this.authService.user$.pipe(filter(u => !u)).subscribe(() => this.router.navigate(['/']));
        }

        return hasDisplayName(authState.profile) ? true : this.router.createUrlTree(['auth/identity']);
      }),
      catchError(() => this.router.navigate(['/']))
    );
  }

  canDeactivate() {
    this.sub?.unsubscribe();
    delete this.sub;
    return true;

    // @TODO #7286 #7273 test :
    /**
     * return this.service.auth$.pipe(
      map(),
      catchError(),
      tap(canActivate => {
        if (canActivate === true) this.redirectOnSignout();
      })
    )

    redirectOnSignout() }
      this.sub = this.service.authState.pipe(
        filter(user => !user)
      ).subscribe(() => this.router.naviguate(['/']));
    }
     */
  }
}
