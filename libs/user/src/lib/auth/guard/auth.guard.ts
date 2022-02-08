import { Injectable } from '@angular/core';
import { AuthService } from '../+state';
import { map, catchError } from 'rxjs/operators';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { hasDisplayName } from '@blockframes/utils/helpers';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private service: AuthService,
    private router: Router,
  ) { }

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.service.auth$.pipe(
      map((authState) => {
        if (!authState) {
          // Set the value of redirectTo
          localStorage.setItem('redirectTo', state.url);
          return this.router.createUrlTree(['/']);
        }

        return hasDisplayName(authState.profile) ? true : this.router.createUrlTree(['auth/identity']);
      }),
      catchError(() => this.router.navigate(['/']))
    );

  }
}
