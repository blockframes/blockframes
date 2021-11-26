import { Injectable } from '@angular/core';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { AuthQuery, AuthService, AuthState } from '@blockframes/auth/+state';
import { of } from 'rxjs';
import { OrganizationService, OrganizationStore } from '@blockframes/organization/+state';
import { getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Injectable({
  providedIn: 'root'
})
@CollectionGuardConfig({ awaitSync: true })
export class EventAuthGuard extends CollectionGuard<AuthState> {
  constructor(
    service: AuthService,
    private query: AuthQuery,
    private afAuth: AngularFireAuth,
    private orgService: OrganizationService,
    private orgStore: OrganizationStore,
    private routerQuery: RouterQuery,
  ) {
    super(service);
  }

  sync() {
    return this.afAuth.authState.pipe(
      switchMap(userAuth => {

        if (!userAuth) return this.router.navigate(['/']);
        if (userAuth.isAnonymous) return of(true);

        return this.service.sync().pipe(
          catchError(() => of('/')),
          map(() => this.query.user),
          switchMap(async user => {
            // Check that onboarding is complete
            const validUser = hasDisplayName(user) && user._meta.emailVerified && user.orgId;
            if (!validUser) {
              return this.router.navigate(['/auth/identity']);
            }

            // Check that org is valid
            const org = await this.orgService.getValue(user.orgId);
            if (org.status !== 'accepted') {
              return this.router.navigate(['/c/organization/create-congratulations']);
            }

            /**
             * If current user is not anonymous, we populate org store
             */
            if (userAuth && !userAuth.isAnonymous) {
              this.orgStore.upsert(org.id, org);
              this.orgStore.setActive(org.id);
              this.orgService.syncActive({ id: org.id });
            }

            /**
             * If current user is ok, but has no access to marketplace
             */
            const app = getCurrentApp(this.routerQuery);

            if (!org.appAccess[app]?.marketplace) {
              return this.router.navigate(['/c/o/request-access'])
            }

            // Everyting is ok
            return true;
          }),
        );
      })
    );
  }

}
