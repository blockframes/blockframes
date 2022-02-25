import { Injectable } from '@angular/core';
import { OrganizationService } from '../+state';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { getOrgModuleAccess } from '@blockframes/utils/apps';
import { AuthService } from '@blockframes/auth/+state';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

@Injectable({ providedIn: 'root' })
export class PendingOrganizationGuard implements CanActivate {
  constructor(
    private service: OrganizationService,
    private router: Router,
    private authService: AuthService,
    private appGuard: AppGuard,
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
          const app = this.appGuard.currentApp;
          const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, app);
          return this.router.createUrlTree([`/c/o/${moduleAccess}/home`]);
        }

        return true;
      })
    );
  }
}
