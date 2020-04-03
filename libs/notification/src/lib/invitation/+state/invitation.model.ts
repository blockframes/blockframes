import { firestore } from 'firebase/app';
import { InvitationFromUserToOrganization, InvitationFromOrganizationToUser, InvitationToAnEvent } from './invitation.firestore';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { createPublicUser } from '@blockframes/user/+state/user.model';
import { PublicOrganization } from '@blockframes/organization/organization/+state/organization.firestore';
import { createPublicOrganization } from '@blockframes/organization/organization/+state/organization.model';

export { InvitationStatus } from './invitation.firestore';

export type Invitation = InvitationFromOrganizationToUser | InvitationFromUserToOrganization | InvitationToAnEvent;

/** Required options to create an Invitation from a User to join an Organization. */
export interface InvitationFromUserToOrganizationOptions {
  id: string;
  toOrg: PublicOrganization;
  fromUser: PublicUser;
}

/** Required options to create an Invitation from an Organization to a User. */
export interface InvitationFromOrganizationToUserOptions {
  id: string;
  fromOrg: PublicOrganization;
  toUser: PublicUser;
}

/** Factory function that create an Invitation of type fromUserToOrganization. */
export function createInvitationFromUserToOrganization(params: InvitationFromUserToOrganizationOptions): InvitationFromUserToOrganization {
  return {
    id: '',
    mode:'request',
    app: 'blockframes',
    type: 'fromUserToOrganization',
    status: 'pending',
    date: firestore.Timestamp.now(),
    ...params,
    toOrg: createPublicOrganization(params.toOrg),
    fromUser: createPublicUser(params.fromUser),
  };
}

/** Factory function that create an Invitation of type fromOrganizationToUser. */
export function createInvitationFromOrganizationToUser(params: InvitationFromOrganizationToUserOptions): InvitationFromOrganizationToUser {
  return {
    app: 'blockframes',
    mode:'invitation',
    type: 'fromOrganizationToUser',
    status: 'pending',
    date: firestore.Timestamp.now(),
    ...params,
    toUser: createPublicUser(params.toUser),
    fromOrg: createPublicOrganization(params.fromOrg),
  };
}

