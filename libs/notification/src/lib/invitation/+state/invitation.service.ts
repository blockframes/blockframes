import { Injectable } from '@angular/core';
import { InvitationState } from './invitation.store';
import { createInvitationToDocument, createInvitationFromUserToOrganization, createInvitationFromOrganizationToUser, Invitation } from './invitation.model';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { OrganizationService } from '@blockframes/organization/organization/+state/organization.service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { PublicOrganization } from '@blockframes/organization/organization/+state/organization.firestore';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'invitations' })
export class InvitationService extends CollectionService<InvitationState> {
  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private orgService: OrganizationService,
    ) {
    super();
  }

  /** Create an Invitation when a user asks to join an Organization. */
  public async sendInvitationToOrg(organizationId: string) {
    const organization = await this.orgService.getValue(organizationId);
    const { uid, firstName, lastName, email } = this.authQuery.user;
    const invitation = createInvitationFromUserToOrganization({
      id: this.db.createId(),
      organization: {id: organization.id, denomination: {full: organization.denomination.full}, logo: organization.logo},
      user: { uid, firstName, lastName, email }
    });
    return this.add(invitation);
  }

  /** Create invitations when an Organization asks users to join it. */
  public async sendInvitationsToUsers(userEmails: string[], organizationId: string) {
    const organization = await this.orgService.getValue(organizationId);
    const userPromises = userEmails.map(async userEmail => {
      // Get a user or create a ghost user when needed
      const invitationId = this.db.createId();
      return this.authService.getOrCreateUserByMail(userEmail, organization.denomination.full, invitationId);
    });
    const users = await Promise.all(userPromises);

    const invitations = users.map(user => {
      return createInvitationFromOrganizationToUser({
        id: this.db.createId(),
        organization: { id: organization.id, denomination: {full: organization.denomination.full}, logo: organization.logo },
        user: { uid: user.uid, email: user.email }
      });
    });

    return this.add(invitations);
  }

  /** Create an Invitation when an Organization is invited to work on a document. */
  public sendDocumentInvitationToOrg({id, denomination, logo}: PublicOrganization, docId: string) {
    const invitation = createInvitationToDocument({
      id: this.db.createId(),
      organization: {id, denomination, logo},
      docId
    });
    return this.add(invitation);
  }

  /** Accept an Invitation and change its status to accepted. */
  public acceptInvitation(invitation: Invitation) {
    return this.update({...invitation, status: 'accepted'});
  }

  /** Decline an Invitation and change its status to declined. */
  public declineInvitation(invitation: Invitation) {
    return this.update({...invitation, status: 'declined'});
  }

  /** Return true if there is already a pending invitation for a list of users */
  public async orgInvitationExists(userEmails: string[]): Promise<boolean> {
    const invitations = await this.getValue();
    const orgInvitations = invitations.filter(
      invitation => invitation.type === 'fromOrganizationToUser'
    );

    return orgInvitations.some(
      invitation => userEmails.includes(invitation.user.email) && invitation.status === 'pending'
    )
  }
}
