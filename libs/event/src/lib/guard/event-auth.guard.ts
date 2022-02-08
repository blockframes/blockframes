import { Injectable } from '@angular/core';
import { switchMap, catchError, take } from 'rxjs/operators';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { AuthService } from '@blockframes/auth/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EventAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private router: Router,
  ) { }

  canActivate() {
    return this.authService.auth$.pipe(
      switchMap(async authState => {
        if (!authState) return this.router.createUrlTree(['/']);
        if (authState.isAnonymous) return true;

        const validUser = hasDisplayName(authState.profile) && authState.emailVerified && authState.profile.orgId;
        if (!validUser) return this.router.createUrlTree(['/auth/identity']);

        const org = await this.orgService.org$.pipe(take(1)).toPromise();
        if (org.status !== 'accepted') return this.router.createUrlTree(['/c/organization/create-congratulations']);
      }),
      catchError(() => this.router.navigate(['/']))
    )
  }

}
