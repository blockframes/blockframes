import { firestore } from 'firebase/app';
import { PublicUser } from '@blockframes/auth';
type Timestamp = firestore.Timestamp;

export interface Invitation {
  id: string;
  app: string;
  type: InvitationType;
  userId?: string;
  user?: PublicUser;
  organizationName?: string;
  organizationId: string;
  docId?: string;
  state: 'accepted' | 'declined' | 'pending';
  date: Timestamp;
}

export const enum InvitationType {
  fromUserToOrganization = 'fromUserToOrganization',
  fromOrganizationToUser = 'fromOrganizationToUser',
  stakeholder = 'stakeholder'
}

/** Required options to create an invitation to join organization (both from user and organization). */
export interface InvitationToJoinOrganizationOptions {
  id: string;
  organizationId: string;
  organizationName: string;
  userId: string;
  user: PublicUser;
  type: InvitationType;
}

/** Required options to create an invitation to work on a document. */
export interface InvitationToWorkOnDocument {
  id: string;
  organizationId: string;
  userId: string;
  docId: string;
}

export function createInvitationToJoinOrganization(
  params: InvitationToJoinOrganizationOptions
): Invitation {
  return {
    app: 'main',
    state: 'pending',
    type: InvitationType.fromUserToOrganization,
    date: firestore.Timestamp.now(),
    ...params
  };
}

export function createInvitationToDocument(params: InvitationToWorkOnDocument): Invitation {
  return {
    app: 'media_delivering',
    state: 'pending',
    type: InvitationType.stakeholder,
    date: firestore.Timestamp.now(),
    ...params
  };
}
