import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/service';
import { combineLatest } from 'rxjs';
import { hasAnonymousIdentity } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
export class IdentityGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.authService.user$,
      this.authService.anonymousCredentials$,
    ]).pipe(
      map(([userAuth, creds]) => {
        if (userAuth && !userAuth.isAnonymous) return true;
        if (!hasAnonymousIdentity(creds, 'protected')) return this.router.createUrlTree([`/organization/${next.params.orgId}/email`], { queryParams: next.queryParams });
        return true;
      })
    );
  }
}
