import { Injectable } from '@angular/core';
import { OrganizationService } from '../+state';
import { CanActivate, Router } from '@angular/router';
import { CollectionGuardConfig } from 'akita-ng-fire';
import { map } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { combineLatest } from 'rxjs';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class OrganizationGuard implements CanActivate {
  constructor(
    protected service: OrganizationService,
    protected router: Router,
    private authQuery: AuthQuery
  ) { }

  canActivate() {
    return combineLatest([
      this.authQuery.user$,
      this.service.org$
    ]).pipe(
      map(([user, org]) => {
        if (!user) return this.router.createUrlTree(['/']);
        if (!user.orgId) return this.router.createUrlTree(['/auth/identity']);
        if (!org) return this.router.createUrlTree(['/auth/identity']);
        if (org.status !== 'accepted') return this.router.createUrlTree(['/c/organization/create-congratulations']);
        return true;
      })
    );
  }
}
