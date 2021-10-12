import { Injectable } from '@angular/core';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { AuthQuery, AuthService, AuthState } from '@blockframes/auth/+state';
import { of } from 'rxjs';
import { OrganizationService } from '@blockframes/organization/+state';

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
  ) {
    super(service);
  }

  sync() {
    return this.afAuth.authState.pipe(
      switchMap(userAuth => {
        /**
         * User is not logged-in or is anonymous. Next guard will take this into account
         */
        if (!userAuth || userAuth.isAnonymous) return of(true);

        /**
         * User is logged in
         */
        return this.service.sync().pipe(
          catchError(() => this.router.navigate(['/'])),
          map(() => this.query.user),
          map(async user => {

            // Check that onboarding is complete
            const validUser = hasDisplayName(user) && user._meta.emailVerified && user.orgId; // @TODO #6756 check user._meta.emailVerified required ?
            if (!validUser) {
              this.router.navigate(['/auth/identity']);
              return false;
            }

            // Check that org is valid
            const org = await this.orgService.getValue(user.orgId);
            if (org.status === 'pending') {
              this.router.navigate(['/c/organization/create-congratulations']);
              return false;
            }

            // Everyting is ok
            return true;
          }),
        );
      })
    );
  }
}
