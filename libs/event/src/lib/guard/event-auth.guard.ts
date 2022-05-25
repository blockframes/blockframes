import { Injectable } from '@angular/core';
import { switchMap, catchError, filter, tap } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/service';
import { OrganizationService } from '@blockframes/organization/service';
import { CanActivate, CanDeactivate, Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { hasDisplayName } from '@blockframes/model';

@Injectable({
  providedIn: 'root'
})
export class EventAuthGuard implements CanActivate, CanDeactivate<unknown> {
  private sub: Subscription;
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

        const org = await firstValueFrom(this.orgService.currentOrg$);
        if (org.status !== 'accepted') return this.router.createUrlTree(['/c/organization/create-congratulations']);

        return true;
      }),
      catchError(() => this.router.navigate(['/'])),
      tap(canActivate => {
        if (canActivate === true) this.redirectOnSignout();
      })
    )
  }

  redirectOnSignout() {
    this.sub = this.authService._user$.pipe(
      filter(user => !user)
    ).subscribe(() => this.router.navigate(['/']));
  }

  canDeactivate() {
    this.sub?.unsubscribe();
    return true;
  }

}
