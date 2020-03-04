import { firestore } from 'firebase/app';
import { InvitationFromUserToOrganization, InvitationFromOrganizationToUser, InvitationToWorkOnDocument } from './invitation.firestore';
import { PublicUser } from '@blockframes/auth/types';
import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';

export { InvitationStatus } from './invitation.firestore';


/** Required options to create an Invitation from a User to join an Organization. */
export interface InvitationFromUserToOrganizationOptions {
  id: string;
  organization: PublicOrganization;
  user: PublicUser;
}

/** Required options to create an Invitation from an Organization to a User. */
export interface InvitationFromOrganizationToUserOptions {
  id: string;
  organization: PublicOrganization;
  user: PublicUser;
}

/** Required options to create an invitation to work on a document. */
export interface InvitationToWorkOnDocumentOptions {
  id: string;
  organization: PublicOrganization;
  docId: string;
}

/** Factory function that create an Invitation of type fromUserToOrganization. */
export function createInvitationFromUserToOrganization(params: InvitationFromUserToOrganizationOptions): InvitationFromUserToOrganization {
  return {
    id: '',
    app: 'main',
    type: 'fromUserToOrganization',
    status: 'pending',
    date: firestore.Timestamp.now(),
    ...params
  };
}

/** Factory function that create an Invitation of type fromOrganizationToUser. */
export function createInvitationFromOrganizationToUser(params: InvitationFromOrganizationToUserOptions): InvitationFromOrganizationToUser {
  return {
    app: 'main',
    type: 'fromOrganizationToUser',
    status: 'pending',
    date: firestore.Timestamp.now(),
    ...params
  };
}

/** Factory function that create an Invitation of type toWorkOnDocument. */
export function createInvitationToDocument(params: InvitationToWorkOnDocumentOptions): InvitationToWorkOnDocument {
  return {
    app: 'media_delivering',
    type: 'toWorkOnDocument',
    status: 'pending',
    date: firestore.Timestamp.now(),
    ...params
  };
}
