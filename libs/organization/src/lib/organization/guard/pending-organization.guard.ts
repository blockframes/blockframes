import { Inject, Injectable } from '@angular/core';
import { OrganizationService } from '../+state';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { App, getOrgModuleAccess } from '@blockframes/utils/apps';
import { AuthService } from '@blockframes/auth/+state';
import { APP } from '@blockframes/utils/routes/utils';

@Injectable({ providedIn: 'root' })
export class PendingOrganizationGuard implements CanActivate {
  constructor(
    private service: OrganizationService,
    private router: Router,
    private authService: AuthService,
    @Inject(APP) private app: App
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.profile$,
      this.service.org$
    ]).pipe(
      map(([user, org]) => {
        if (!user) return this.router.createUrlTree(['/']);
        if (!user.orgId) return this.router.createUrlTree(['/auth/identity']);
        if (!org) return this.router.createUrlTree(['/auth/identity']);

        if (org.status === 'accepted') {
          const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, this.app);
          return this.router.createUrlTree([`/c/o/${moduleAccess}/home`]);
        }

        return true;
      })
    );
  }
}
