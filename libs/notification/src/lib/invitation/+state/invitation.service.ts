import { Injectable } from '@angular/core';
import { InvitationState, InvitationStore } from './invitation.store';
import { Invitation, createInvitation } from './invitation.model';
import { CollectionConfig, CollectionService, AtomicWrite } from 'akita-ng-fire';
import { OrganizationQuery, createPublicOrganization } from '@blockframes/organization/+state';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';
import { createPublicUser } from '@blockframes/user/+state';
import { InvitationDocument } from './invitation.firestore';
import { toDate } from '@blockframes/utils/helpers';
import { getInvitationMessage, cleanInvitation } from '../invitation-utils';
import { from, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'invitations' })
export class InvitationService extends CollectionService<InvitationState> {
  constructor(
    store: InvitationStore,
    private authQuery: AuthQuery,
    private authService: AuthService,
    private orgQuery: OrganizationQuery,
  ) {
    super(store);
  }

  formatFromFirestore(_invitation: InvitationDocument): Invitation {
    const invitation = {
      ..._invitation,
      date: toDate(_invitation.date)
    }

    const isForMe = this.isInvitationForMe(invitation);
    invitation.message = getInvitationMessage(invitation, isForMe);
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

  /** Return true if there is already a pending invitation for a list of users */
  public async orgInvitationExists(userEmails: string[]): Promise<boolean> {
    const orgId = this.authQuery.orgId;
    const orgInvitations = await this.getValue(ref => ref.where('mode', '==', 'invitation')
      .where('type', '==', 'joinOrganization')
      .where('fromOrg.id', '==', orgId));

    return orgInvitations.some(
      invitation => userEmails.includes(invitation.toUser.email) && invitation.status === 'pending'
    );
  }

  public isInvitationForMe(invitation: Invitation): boolean {
    return invitation.toOrg?.id === this.authQuery.orgId || invitation.toUser?.uid === this.authQuery.userId
  }

  /**
   * Create an invitation with mode "request"
   * @param who Destination type
   */
  request(who: 'user' | 'org', id: string) {
    return {
      from: (fromType: 'user' | 'org') => ({
        to: async (type: 'attendEvent' | 'joinOrganization', docId: string, write?: AtomicWrite) => {
          const base = { mode: 'request', type, docId } as Partial<Invitation>
          if (who === 'user') {
            base['toUser'] = createPublicUser({ uid: id });
          } else if (who === 'org') {
            base['toOrg'] = createPublicOrganization({ id });
          }
          if (fromType === 'user') {
            base['fromUser'] = this.authQuery.user;
          } else if (fromType === 'org') {
            base['fromOrg'] = createPublicOrganization(this.orgQuery.getActive());
          }
          const invitation = createInvitation(base);
          await this.add(invitation, { write });
        }
      })
    }
  }

  /**
   * Create an invitation with mode "invitation"
   * @param who Destination type
   * @param idOrEmails "emails" for user, "ids" for org
   */
  invite(who: 'user' | 'org', idOrEmails: string | string[]) {
    return {
      from: (fromType: 'user' | 'org') => ({
        to: (type: 'attendEvent' | 'joinOrganization', docId: string, write?: AtomicWrite) => {
          const base = { mode: 'invitation', type, docId } as Partial<Invitation>
          if (fromType === 'user') {
            base['fromUser'] = createPublicUser(this.authQuery.user);
          } else if (fromType === 'org') {
            base['fromOrg'] = createPublicOrganization(this.orgQuery.getActive());
          }
          const recipients = Array.isArray(idOrEmails) ? idOrEmails : [idOrEmails];
          // We use mergeMap to keep all subscriptions in memory (switchMap unsubscribe automatically)
          if (who === 'org') {
            return from(recipients).pipe(
              map(recipient => createInvitation({ ...base, toOrg: createPublicOrganization({ id: recipient }) })),
              mergeMap(invitation => this.add(invitation, { write }))
            );
          } else if (who === 'user') {
            return from(recipients).pipe(
              mergeMap(recipient => this.authService.getOrCreateUserByMail(recipient, this.orgQuery.getActiveId())),
              map(toUser => createInvitation({ ...base, toUser: createPublicUser({ uid: toUser.uid }) })),
              mergeMap(invitation => this.add(invitation, { write }))
            );
          } else {
            return of('');
          }
        }
      })
    }
  }

}
