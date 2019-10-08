import { Injectable } from '@angular/core';
import { snapshot } from '@blockframes/utils';
import { InvitationState } from './invitation.store';
import { AuthQuery, AuthService } from '@blockframes/auth';
import {
  createInvitationToJoinOrganization,
  Invitation,
  createInvitationToDocument,
  InvitationType,
  InvitationStatus
} from './invitation.model';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Organization, PublicOrganization } from '@blockframes/organization';

@Injectable({
  providedIn: 'root'
})
@CollectionConfig({ path: 'invitations' })
export class InvitationService extends CollectionService<InvitationState> {
  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService
  ) {
    super();
  }

  /** Create an invitation when a user asks to join an organization */
  public async sendInvitationToOrg(organizationId: string): Promise<void> {
    const organization = await snapshot<Organization>(`orgs/${organizationId}`);
    const { uid, name, surname, email } = this.authQuery.getValue().user;
    const invitation = createInvitationToJoinOrganization({
      id: this.db.createId(),
      organization: {id: organization.id, name: organization.name},
      user: { uid, name, surname, email },
      type: InvitationType.fromUserToOrganization
    });
    return this.add(invitation);
  }

  /** Create an invitation when an organization asks a user to join it */
  public async sendInvitationToUser(userEmail: string, organizationId: string): Promise<void> {
    // Get a user or create a ghost user when needed
    const { uid, email } = await this.authService.getOrCreateUserByMail(userEmail);
    const organization = await snapshot<Organization>(`orgs/${organizationId}`);
    const invitation = createInvitationToJoinOrganization({
      id: this.db.createId(),
      organization: {id: organization.id, name: organization.name},
      user: { uid, email },
      type: InvitationType.fromOrganizationToUser
    });
    return this.add(invitation);
  }

  /** Create an invitation when an organization is invited to work on a document */
  public sendDocumentInvitationToOrg({id, name}: PublicOrganization, docId: string): Promise<void> {
    const invitation = createInvitationToDocument({
      id: this.db.createId(),
      organization: {id, name},
      docId
    });
    return this.add(invitation);
  }

  public acceptInvitation(invitation: Invitation) {
    return this.update({...invitation, status: InvitationStatus.accepted});
  }

  public declineInvitation(invitation: Invitation) {
    return this.update({...invitation, status: InvitationStatus.declined});
  }
}
