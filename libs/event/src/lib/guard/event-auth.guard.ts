import { Injectable } from '@angular/core';
import { switchMap, catchError, take, filter } from 'rxjs/operators';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { AuthService } from '@blockframes/auth/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { CanActivate, CanDeactivate, Router } from '@angular/router';
import { Subscription } from 'rxjs';

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

        if (!this.sub) {
          this.sub = this.authService.user$.pipe(filter(u => !u)).subscribe(() => this.router.navigate(['/']));
        }

        const validUser = hasDisplayName(authState.profile) && authState.emailVerified && authState.profile.orgId;
        if (!validUser) return this.router.createUrlTree(['/auth/identity']);

        const org = await this.orgService.currentOrg$.pipe(take(1)).toPromise();
        if (org.status !== 'accepted') return this.router.createUrlTree(['/c/organization/create-congratulations']);

        return true;
      }),
      catchError(() => this.router.navigate(['/']))
    )
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
