import { Injectable } from '@angular/core';
import { InvitationState, InvitationStore } from './invitation.store';
import { createInvitationFromUserToOrganization, createInvitationFromOrganizationToUser, Invitation, createInvitation } from './invitation.model';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { OrganizationService, OrganizationQuery, Organization } from '@blockframes/organization/+state';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';
import { UserService, PublicUser } from '@blockframes/user/+state';
import { InvitationDocument, InvitationType, InvitationMode } from './invitation.firestore';
import { toDate } from '@blockframes/utils/helpers';
import { getInvitationMessage, cleanInvitation } from '../invitation-utils';

type SenderKey = 'fromUser' | 'toUser' | 'fromOrg' | 'toOrg';
type Sender = Organization | PublicUser;

type SenderKey = 'fromUser' | 'toUser' | 'fromOrg' | 'toOrg';
type Sender = Organization | PublicUser;

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'invitations' })
export class InvitationService extends CollectionService<InvitationState> {
  constructor(
    store: InvitationStore,
    private authQuery: AuthQuery,
    private authService: AuthService,
    private userService: UserService,
    private orgService: OrganizationService,
    private orgQuery: OrganizationQuery,
  ) {
    super(store);
  }

  formatFromFirestore(_invitation: InvitationDocument): Invitation {
    const invitation ={
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

  formatToFirestore(invitation: Invitation) {
    for (const key in invitation) {
      if (typeof invitation[key] === 'undefined') delete invitation[key];
    }
    return invitation;
  }

  /** Create an Invitation when a user asks to join an Organization. */
  public async sendInvitationToOrg(organizationId: string) {
    const organization = await this.orgService.getValue(organizationId);
    const { uid, firstName, lastName, email } = this.authQuery.user;
    const invitation = createInvitationFromUserToOrganization({
      id: this.db.createId(),
      toOrg: { id: organization.id, denomination: { full: organization.denomination.full }, logo: organization.logo },
      fromUser: { uid, firstName, lastName, email }
    });
    return this.add(invitation);
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

  public isInvitationForMe(invitation: Invitation) : boolean {
    return invitation.toOrg?.id === this.authQuery.orgId || invitation.toUser?.uid === this.authQuery.userId
  }

  /**
   * Create an invitation with mode "request"
   * @param who Destination type
   */
  request(who: 'user' | 'org', id: string) {
    return {
      from: (from: 'user' | 'org') => ({
        to: async (type: 'attendEvent' | 'joinOrganization', docId: string) => {
          const base = { mode: 'request', type, docId } as Partial<Invitation>
          if (who === 'user') {
            base['toUser'] = await this.userService.getValue(id)
          } else if (who === 'org') {
            base['toOrg'] = await this.orgService.getValue(id)
          }
          if (from === 'user') {
            base['fromUser'] = this.authQuery.user;
          } else if (from === 'org') {
            base['fromOrg'] = this.orgQuery.getActive();
          }
          const invitation = createInvitation(base);
          this.add(invitation);
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
        to: async (type: 'attendEvent' | 'joinOrganization', docId: string) => {
          const base = { mode: 'request', type, docId } as Partial<Invitation>
          if (from === 'user') {
            base['fromUser'] = this.authQuery.user;
          } else if (from === 'org') {
            base['fromOrg'] = this.orgQuery.getActive();
          }
          const recipients = Array.isArray(idOrEmails) ? idOrEmails : [idOrEmails];
          const orgName = this.orgQuery.getActive().denomination.full;
          const promises = recipients.map(async recipient => {
            let invitation: Partial<Invitation>;
            if (who === 'user') {
              invitation = await this.authService.getOrCreateUserByMail(recipient, orgName).then(toUser => ({ ...base, toUser }))
            } else if (who === 'org') {
              invitation = await this.orgService.getValue(recipient).then(toOrg => ({ ...base, toOrg }))
            }
            return createInvitation(invitation);
          });
          const invitations = await Promise.all(promises);
          this.add(invitations);
        }
      })
    }
  }

}
