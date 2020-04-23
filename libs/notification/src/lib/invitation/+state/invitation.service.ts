import { Injectable } from '@angular/core';
import { InvitationState, InvitationStore } from './invitation.store';
import { createInvitationFromUserToOrganization, createInvitationFromOrganizationToUser, Invitation, createInvitation } from './invitation.model';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { OrganizationService, OrganizationQuery, Organization } from '@blockframes/organization/+state';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';
import { UserService, PublicUser } from '@blockframes/user/+state';
import { InvitationDocument, InvitationType, InvitationMode } from './invitation.firestore';
import { toDate } from '@blockframes/utils/helpers';

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

  formatFromFirestore(invitation: InvitationDocument): Invitation {
    return {
      ...invitation,
      date: toDate(invitation.date)
    }
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

  /** 
   * Create invitations when an Organization asks users to join it.
   * @param userEmails A list of email to invite
   * @param organizationId The organization sender. In not provided, take the current one.
   */
  public async sendInvitationsToUsers(userEmails: string[], organizationId?: string) {
    const organization = !!organizationId
      ? await this.orgService.getValue(organizationId)
      : this.orgQuery.getActive();
    
    const userPromises = userEmails.map(async userEmail => {
      // Get a user or create a ghost user when needed
      const user = await this.authService.getOrCreateUserByMail(userEmail, organization.denomination.full);
      return createInvitationFromOrganizationToUser({
        id: this.db.createId(),
        fromOrg: { id: organization.id, denomination: { full: organization.denomination.full }, logo: organization.logo },
        toUser: { uid: user.uid, email: user.email }
      });
    });
    const invitations = await Promise.all(userPromises);
    return this.add(invitations);
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
    const orgInvitations = invitations.filter(
      invitation => invitation.type === 'fromOrganizationToUser'
    );

    return orgInvitations.some(
      invitation => userEmails.includes(invitation.toUser.email) && invitation.status === 'pending'
    );
  }

  public isInvitationForMe(invitation: Invitation) : Boolean {
    return invitation.toOrg?.id === this.authQuery.orgId || invitation.toUser?.uid === this.authQuery.userId
  }

  /** Get the key (fromUser, toUser, fromOrg, toOrg) and sender for an invitation */
  getSender(mode: InvitationMode, type: InvitationType): [SenderKey, Sender] {
    if (type === 'event' || type === 'fromOrganizationToUser') {
      const org =  this.orgQuery.getActive();
      return mode === 'invitation' ? [ 'fromOrg', org ] : [ 'toOrg', org ];
    } else if (type === 'fromUserToOrganization') {
      const user = this.authQuery.user;
      return mode === 'invitation' ? [ 'fromUser', user ] : [ 'toUser', user ]
    }
  }

  /** Request a user to invite you to a doc  */
  async requestUser(docId: string, userId: string, type: 'fromUserToOrganization') {
    const [ senderKey, sender ] = this.getSender('request', type);
    const base = { docId, mode: 'request', type, [senderKey]: sender } as Partial<Invitation>;
    const toUser = await this.userService.getValue(userId);
    const invitation = createInvitation({ ...base, toUser });
    this.add(invitation);
  }

  /** Request an organization to invite you to a doc  */
  async requestOrg(docId: string, orgIds: string, type: 'event' | 'fromOrganizationToUser') {
    const [ senderKey, sender ] = this.getSender('request', type);
    const base = { docId, mode: 'request', type, [senderKey]: sender } as Partial<Invitation>;
    const toOrg = await this.orgService.getValue(orgIds);
    const invitation = createInvitation({ ...base, toOrg });
    this.add(invitation);
  }

  /** Invite one or many user to a doc */
  async invitUsers(docId: string, emails: string[], type: 'event' | 'fromOrganizationToUser') {
    const [ senderKey, sender ] = this.getSender('request', type);
    const base = { docId, mode: 'invitation', type, [senderKey]: sender } as Partial<Invitation>;
    const promises = emails.map(async email => {
      const orgName = this.orgQuery.getActive().denomination.full;
      const toUser = await this.authService.getOrCreateUserByMail(email, orgName);
      return createInvitation({ ...base, toUser })
    });
    const invitations = await Promise.all(promises);
    this.add(invitations);
  }
}
