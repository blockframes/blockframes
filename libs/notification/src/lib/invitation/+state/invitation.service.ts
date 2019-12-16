import { Injectable } from '@angular/core';
import { snapshot } from '@blockframes/utils';
import { InvitationState } from './invitation.store';
import { AuthQuery, AuthService } from '@blockframes/auth';
import { createInvitationToDocument, createInvitationFromUserToOrganization, createInvitationFromOrganizationToUser } from './invitation.model';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Organization, PublicOrganization } from '@blockframes/organization';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { Invitation, InvitationStatus } from './invitation.firestore';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'invitations' })
export class InvitationService extends CollectionService<InvitationState> {
  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private orgService: OrganizationService
    ) {
    super();
  }

  /** Create an Invitation when a user asks to join an Organization. */
  public async sendInvitationToOrg(organizationId: string) {
    const organization = await this.orgService.getValue(organizationId);
    const { uid, name, surname, email } = this.authQuery.user;
    const invitation = createInvitationFromUserToOrganization({
      id: this.db.createId(),
      organization: {id: organization.id, denomination: organization.denomination},
      user: { uid, name, surname, email }
    });
    return this.add(invitation);
  }

  /** Create an Invitation when an Organization asks a user to join it. */
  public async sendInvitationToUser(userEmail: string, organizationId: string) {
    // Get a user or create a ghost user when needed
    const invitationId = this.db.createId();
    const organization = await snapshot<Organization>(`orgs/${organizationId}`);
    const { uid, email } = await this.authService.getOrCreateUserByMail(userEmail, organization.denomination.full, invitationId);
    const invitation = createInvitationFromOrganizationToUser({
      id: this.db.createId(),
      organization: {id: organization.id, denomination: organization.denomination},
      user: { uid, email }
    });
    return this.add(invitation);
  }

  /** Create an Invitation when an Organization is invited to work on a document. */
  public sendDocumentInvitationToOrg({id, denomination}: PublicOrganization, docId: string) {
    const invitation = createInvitationToDocument({
      id: this.db.createId(),
      organization: {id, denomination},
      docId
    });
    return this.add(invitation);
  }

  /** Accept an Invitation and change its status to accepted. */
  public acceptInvitation(invitation: Invitation) {
    return this.update({...invitation, status: InvitationStatus.accepted});
  }

  /** Decline an Invitation and change its status to declined. */
  public declineInvitation(invitation: Invitation) {
    return this.update({...invitation, status: InvitationStatus.declined});
  }
}
