import { Injectable } from '@angular/core';
import { AuthQuery, AuthService, AuthState } from '../+state';
import { switchMap, map, catchError } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { getOrgModuleAccess, getCurrentApp, App } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class NoAuthGuard extends CollectionGuard<AuthState> {
  constructor(
    service: AuthService,
    private orgService: OrganizationService,
    private query: AuthQuery,
    private afAuth: AngularFireAuth,
    private routerQuery: RouterQuery,
  ) {
    super(service);
  }

  sync() {
    return this.afAuth.authState.pipe(
      switchMap(userAuth => {
        if (!userAuth || userAuth.isAnonymous) { return Promise.resolve(true); }
        return this.service.sync().pipe(
          catchError(() => Promise.resolve(true)),
          map(() => this.query.orgId),
          switchMap(orgId => orgId ? this.orgService.getValue(orgId) : new Promise<false>(r => r(false))),
          map(org => {
            if (!org) { return '/auth/identity'; }
            const app = getCurrentApp(this.routerQuery) as App | 'crm';
            if (app === 'crm') {
              return '/c/o/dashboard/crm';
            } else {
              const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, app);
              return `/c/o/${moduleAccess}/home`;
            }
          })
        );
      })
    );
  }
}