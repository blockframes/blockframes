import { Injectable } from '@angular/core';
import { AuthQuery, AuthService, AuthState } from '../+state';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { of } from 'rxjs';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { OrganizationService } from '@blockframes/organization/+state';
import { InvitationService } from '@blockframes/invitation/+state';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class IdentityGuard extends CollectionGuard<AuthState> {
  constructor(
    service: AuthService,
    private orgService: OrganizationService,
    private invitationService: InvitationService,
    private afAuth: AngularFireAuth,
    private query: AuthQuery,
  ) {
    super(service);
  }

  sync() {
    return this.afAuth.authState.pipe(
      switchMap(userAuth => {
        if (!userAuth) {
          return of(true);
        };
        if (!userAuth.emailVerified) {
          // return of(this.router.navigate(['c/organization/join-congratulations']));
        }
        return this.service.sync().pipe(
          catchError(() => Promise.resolve(true)),
          map(() => this.query.user),
          map(async user => {
            if (!hasDisplayName(user)) { return true; }
            if (user.orgId) {
              const org = await this.orgService.getValue(user.orgId);
              if (!org) {
                return true;
              }

              if (org.status === 'pending') {
                //return this.router.navigate(['c/organization/create-congratulations']);
              } else {
                return this.router.navigate(['c/o']);
              }
            } else {
              const requests = await this.invitationService.getValue(ref => ref.where('mode', '==', 'request')
                .where('type', '==', 'joinOrganization')
                .where('fromUser.uid', '==', user.uid));
              if (requests.find(request => request.status === 'pending')) {
                return this.router.navigate(['c/organization/join-congratulations']);
              } else if (requests.find(invitation => invitation.status === 'accepted')) {
                return 'c/o';
              } else {
                const invitations = await this.invitationService.getValue(ref => ref.where('mode', '==', 'invitation')
                  .where('type', '==', 'joinOrganization')
                  .where('toUser.uid', '==', user.uid));

                if (invitations.find(invitation => invitation.status === 'accepted')) {
                  return 'c/o';
                } else {
                  return true;
                }
              }
            }
          }),
        );
      })
    );
  }
}
