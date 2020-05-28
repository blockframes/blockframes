import { Injectable } from '@angular/core';
import { AuthQuery, AuthService, AuthState } from '../+state';
import { switchMap, map, catchError } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { getOrgModuleAccess, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Injectable({
  providedIn: 'root'
})
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
        if (!userAuth) { return Promise.resolve(true); }
        return this.service.sync().pipe(
          catchError(() => Promise.resolve(true)),
          map(_ => this.query.orgId),
          switchMap(orgId => orgId ? this.orgService.getValue(orgId) : new Promise<false>(r => r(false))),
          map(org => {
            if (!org) { return '/c/organization'; }
            const app = getCurrentApp(this.routerQuery);
            const [moduleAccess = 'dashboard'] = getOrgModuleAccess(org, app);
            return `/c/o/${moduleAccess}/home`;
          })
        );
      })
    );
  }
}