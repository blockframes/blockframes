import { Injectable } from '@angular/core';
import { map, switchMap, catchError, take } from 'rxjs/operators';
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
    private orgService: OrganizationService
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
            const validUser = hasDisplayName(user) && userAuth.emailVerified && user.orgId;
            if (!validUser) {
              return this.router.navigate(['/auth/identity']);
            }

            // Check that org is valid
            const org = await this.orgService.getValue(user.orgId);
            if (org.status !== 'accepted') {
              return this.router.navigate(['/c/organization/create-congratulations']);
            }

            /**
             * If current user is not anonymous, we populate org on service 
             * @TODO #7273 remove when we switch to ngfire
             */
            if (userAuth && !userAuth.isAnonymous) {
              this.orgService.org$.pipe(take(1)).toPromise();
            }

            // Everyting is ok
            return true;
          }),
        );
      })
    );
  }

}
