import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { CollectionConfig, CollectionService, AtomicWrite } from 'akita-ng-fire';
import { OrganizationQuery, createPublicOrganization, Organization } from '@blockframes/organization/+state';
import { AuthQuery, User } from '@blockframes/auth/+state';
import { createPublicUser } from '@blockframes/user/+state';
import { toDate } from '@blockframes/utils/helpers';
import { InvitationState, InvitationStore } from './invitation.store';
import { Invitation, createInvitation } from './invitation.model';
import { InvitationDocument } from './invitation.firestore';
import { cleanInvitation } from '../invitation-utils';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from '@blockframes/utils/apps';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'invitations' })
export class InvitationService extends CollectionService<InvitationState> {
  private hasUserAnOrgOrIsAlreadyInvited = this.functions.httpsCallable('hasUserAnOrgOrIsAlreadyInvited');

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

  /** Return true if there is already a pending invitation for a list of users */
  public async orgInvitationOrUserOrgIdExists(userEmails: string[]): Promise<boolean> {
    return await this.hasUserAnOrgOrIsAlreadyInvited(userEmails).toPromise();
  }

  public isInvitationForMe(invitation: Invitation): boolean {
    return invitation.toOrg?.id === this.authQuery.orgId || invitation.toUser?.uid === this.authQuery.userId
  }

  /**
   * Create an invitation with mode "request"
   * @param orgId The org the request is made to
   */
  request(orgId: string, fromUser: User = this.authQuery.user) {
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
        const app = getCurrentApp(this.routerQuery);

        console.log(`E->> ${JSON.stringify(invitation)} : ${app}}`);
        return f({ emails: recipients, invitation, app }).toPromise();

      }
    }
  }
}
