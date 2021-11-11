import { Injectable } from '@angular/core';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { AuthQuery, AuthService, AuthState } from '@blockframes/auth/+state';
import { of } from 'rxjs';
import { OrganizationService, OrganizationStore } from '@blockframes/organization/+state';

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
  ) {
    super(service);
  }

  sync() {
    return this.afAuth.authState.pipe(
      switchMap(userAuth => {

        /**
         * User is not logged in
         */
        if (!userAuth) return this.router.navigate(['/']);

        /**
         * User is anonymous.
         */
        if (userAuth.isAnonymous) return of(true);

        /**
         * User is logged in
         */
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
            if (org.status === 'pending') {
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

            // Everyting is ok
            return true;
          }),
        );
      })
    );
  }

}
