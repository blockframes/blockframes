import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { CollectionConfig, CollectionService, AtomicWrite } from 'akita-ng-fire';
import { OrganizationQuery, createPublicOrganization, Organization } from '@blockframes/organization/+state';
import { AuthQuery, AuthState, User } from '@blockframes/auth/+state';
import { createPublicUser, PublicUser } from '@blockframes/user/+state';
import { toDate } from '@blockframes/utils/helpers';
import { InvitationState, InvitationStore } from './invitation.store';
import { Invitation, createInvitation } from './invitation.model';
import { InvitationDocument } from './invitation.firestore';
import { cleanInvitation } from '../invitation-utils';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, getOrgAppAccess } from '@blockframes/utils/apps';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'invitations' })
export class InvitationService extends CollectionService<InvitationState> {
  readonly useMemorization = true;
  /**
   * Return true if there is already a pending invitation for a list of users
   */
  public hasUserAnOrgOrIsAlreadyInvited = this.functions.httpsCallable('hasUserAnOrgOrIsAlreadyInvited');

  /**
   * Return a boolean or a PublicOrganization doc if there is an invitation linked to the email.
   * Return false if there is no invitation at all.
   */
  public getInvitationLinkedToEmail = this.functions.httpsCallable('getInvitationLinkedToEmail');

  myInvitations$: Observable<Invitation[]> = this.authQuery.select().pipe(
    switchMap((user: AuthState) => {
      if (user.profile.orgId) {
        return combineLatest([
          this.valueChanges(ref => ref.where('toOrg.id', '==', user.profile.orgId)),
          this.valueChanges(ref => ref.where('toUser.uid', '==', user.profile.uid))
        ])
      } else return of()
    }),
    map(([toOrg, toUser]) => [...toOrg, ...toUser]),
    shareReplay({ refCount: true, bufferSize: 1 }),
  )

  /** Invitations where current user is a guest */
  guestInvitations$: Observable<Invitation[]> = this.authQuery.select().pipe(
    switchMap((user: AuthState) => combineLatest([
      this.valueChanges(ref => ref.where('fromUser.uid', '==', user.uid).where('mode', '==', 'request')),
      this.valueChanges(ref => ref.where('toUser.uid', '==', user.uid).where('mode', '==', 'invitation'))
    ])),
    map(([fromUser, toUser]) => [...fromUser, ...toUser]),
    shareReplay({ refCount: true, bufferSize: 1 }),
  )

  constructor(
    store: InvitationStore,
    private authQuery: AuthQuery,
    private orgQuery: OrganizationQuery,
    private functions: AngularFireFunctions,
    private routerQuery: RouterQuery
  ) {
    super(store);
  }

  formatFromFirestore(_invitation: InvitationDocument): Invitation {
    const invitation = {
      ..._invitation,
      date: toDate(_invitation.date)
    }
    return invitation;
  }

  formatToFirestore(invitation: Invitation): Invitation {
    return cleanInvitation(invitation);
  }

  /////////////
  // QUERIES //
  /////////////

  /** Accept an Invitation and change its status to accepted. */
  public acceptInvitation(invitation: Invitation) {
    // @TODO (#2500) should be handled by a backend function to prevent ugly rules
    return this.update({ ...invitation, status: 'accepted' });
  }

  /** Decline an Invitation and change its status to declined. */
  public declineInvitation(invitation: Invitation) {
    // @TODO (#2500) should be handled by a backend function to prevent ugly rules
    return this.update({ ...invitation, status: 'declined' });
  }

  public isInvitationForMe(invitation: Invitation): boolean {
    return invitation.toOrg?.id === this.authQuery.orgId || invitation.toUser?.uid === this.authQuery.userId
  }

  /**
   * Create an invitation with mode "request"
   * @param orgId The org the request is made to
   */
  request(orgId: string, fromUser: User | PublicUser = this.authQuery.user) {
    return {
      to: async (type: 'attendEvent' | 'joinOrganization', eventId?: string, write?: AtomicWrite) => {
        const request = { mode: 'request', type } as Partial<Invitation>;
        if (type === 'attendEvent') {
          request.eventId = eventId;
        }

        request.toOrg = createPublicOrganization({ id: orgId });

        request.fromUser = createPublicUser(fromUser);
        const invitation = createInvitation(request);
        await this.add(invitation, { write });
      }
    }
  }

  /**
   * Create an invitation with mode "invitation"
   * @param idOrEmails "emails" for user, "ids" for org
   */
  invite(idOrEmails: string | string[], fromOrg: Organization = this.orgQuery.getActive()) {
    return {
      to: (type: 'attendEvent' | 'joinOrganization', eventId?: string) => {
        const invitation = { mode: 'invitation', type } as Partial<Invitation>;
        if (type === 'attendEvent') {
          invitation.eventId = eventId;
        }
        invitation.fromOrg = createPublicOrganization(fromOrg);
        const recipients = Array.isArray(idOrEmails) ? idOrEmails : [idOrEmails];

        const f = this.functions.httpsCallable('inviteUsers');
        let app = getCurrentApp(this.routerQuery);
        if (app === 'crm') {
          // Instead use first found app where org has access to
          app = getOrgAppAccess(fromOrg)[0];
        }
        return f({ emails: recipients, invitation, app }).toPromise();
      }
    }
  }

}
