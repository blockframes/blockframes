import { Injectable } from '@angular/core';
import { AuthService } from '../+state';
import { map, } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { getOrgModuleAccess, getCurrentApp, App } from '@blockframes/utils/apps';
import { combineLatest } from 'rxjs';
import { ActivatedRoute, CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  canActivate() {
    return combineLatest([
      this.authService.auth$,
      this.orgService.org$
    ]).pipe(
      map(([authState, org]) => {
        if (!authState || authState.isAnonymous) return true;

        if (!org) return this.router.createUrlTree(['/auth/identity']);

        const app = getCurrentApp(this.route) as App | 'crm';
        if (app === 'crm') return this.router.createUrlTree(['/c/o/dashboard/crm']);

        const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, app);
        return this.router.createUrlTree([`/c/o/${moduleAccess}/home`]);

      })
    );
  }
}