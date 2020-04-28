import { InvitationFromUserToOrganizationRaw, InvitationFromOrganizationToUserRaw, InvitationToAnEventRaw } from './invitation.firestore';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { createPublicUser } from '@blockframes/user/+state/user.model';
import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { createPublicOrganization } from '@blockframes/organization/+state/organization.model';

export { InvitationStatus } from './invitation.firestore';

export type Invitation = InvitationFromOrganizationToUserRaw<Date> | InvitationFromUserToOrganizationRaw<Date> | InvitationToAnEventRaw<Date>;

export type InvitationToAnEvent =  InvitationToAnEventRaw<Date>;

export type InvitationFromUserToOrganization =  InvitationFromUserToOrganizationRaw<Date>;

export type InvitationFromOrganizationToUser =  InvitationFromOrganizationToUserRaw<Date>;

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

/** Create an invitation for an event */
export function createEventInvitation(params: Partial<InvitationToAnEvent> = {}): InvitationToAnEvent {
  return {
    id: '',
    mode: 'invitation',
    status: 'pending',
    type: 'event',
    docId: '',
    date: new Date(),
    ...params,
    toUser: createPublicUser(params.toUser),
    fromUser: params.fromUser ? createPublicUser(params.fromUser) : undefined,
    fromOrg: params.fromOrg ? createPublicOrganization(params.fromOrg) : undefined,
  };
}

/** Factory function that create an Invitation of type fromUserToOrganization. */
export function createInvitationFromUserToOrganization(params: InvitationFromUserToOrganizationOptions): InvitationFromUserToOrganization {
  return {
    id: '',
    mode:'request',
    type: 'fromUserToOrganization',
    status: 'pending',
    date: new Date(),
    ...params,
    toOrg: createPublicOrganization(params.toOrg),
    fromUser: createPublicUser(params.fromUser),
  };
}

/** Factory function that create an Invitation of type fromOrganizationToUser. */
export function createInvitationFromOrganizationToUser(params: InvitationFromOrganizationToUserOptions): InvitationFromOrganizationToUser {
  return {
    mode:'invitation',
    type: 'fromOrganizationToUser',
    status: 'pending',
    date: new Date(),
    ...params,
    toUser: createPublicUser(params.toUser),
    fromOrg: createPublicOrganization(params.fromOrg),
  };
}

