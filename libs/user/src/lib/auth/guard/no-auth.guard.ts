import { Injectable } from '@angular/core';
import { AuthService } from '../+state';
import { map, } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { getOrgModuleAccess } from '@blockframes/utils/apps';
import { combineLatest } from 'rxjs';
import { CanActivate, Router } from '@angular/router';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private router: Router,
    private appGuard: AppGuard,
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.auth$,
      this.orgService.org$
    ]).pipe(
      map(([authState, org]) => {
        if (!authState || authState.isAnonymous) return true;

        if (!org) return this.router.createUrlTree(['/auth/identity']);

        const app = this.appGuard.currentApp;
        if (app === 'crm') return this.router.createUrlTree(['/c/o/dashboard/crm']);

        const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, app);
        return this.router.createUrlTree([`/c/o/${moduleAccess}/home`]);

      })
    );
  }
}