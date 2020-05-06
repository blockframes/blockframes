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
    const invitations = await this.getValue(ref => ref.where('fromOrg.id', '==', orgId));
    const orgInvitations = invitations.filter(({ type, mode }) => {
      return type === 'joinOrganization' && mode === 'invitation';
    });

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
      from: (from: 'user' | 'org') => ({
        to: async (type: 'attendEvent' | 'joinOrganization', docId: string, write?: AtomicWrite) => {
          const base = { mode: 'request', type, docId } as Partial<Invitation>
          if (who === 'user') {
            base['toUser'] = createPublicUser({ uid: id });
          } else if (who === 'org') {
            base['toOrg'] = createPublicOrganization({ id });
          }
          if (from === 'user') {
            base['fromUser'] = this.authQuery.user;
          } else if (from === 'org') {
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
      from: (from: 'user' | 'org') => ({
        to: async (type: 'attendEvent' | 'joinOrganization', docId: string, write?: AtomicWrite) => {
          const base = { mode: 'invitation', type, docId } as Partial<Invitation>
          if (from === 'user') {
            base['fromUser'] = createPublicUser(this.authQuery.user);
          } else if (from === 'org') {
            base['fromOrg'] = createPublicOrganization(this.orgQuery.getActive());
          }
          const recipients = Array.isArray(idOrEmails) ? idOrEmails : [idOrEmails];
          const orgName = this.orgQuery.getActive().denomination.full;
          const promises = recipients.map(async recipient => {
            let invitation: Partial<Invitation>;
            if (who === 'user') {
              invitation = await this.authService.getOrCreateUserByMail(recipient, orgName).then(toUser => ({ ...base, toUser: createPublicUser({ uid: toUser.uid }) }));
            } else if (who === 'org') {
              invitation = { ...base, toOrg: createPublicOrganization({ id: recipient }) };
            }
            return createInvitation(invitation);
          });
          const invitations = await Promise.all(promises);
          console.log('invitations', invitations)
          await this.add(invitations, { write });
        }
      })
    }
  }

}
