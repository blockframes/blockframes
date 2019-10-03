import { firestore } from 'firebase/app';
import { PublicUser } from '@blockframes/auth';
import { PublicOrganization } from '@blockframes/organization';
type Timestamp = firestore.Timestamp;

export interface Invitation {
  id: string;
  app: string;
  type: InvitationType;
  user?: PublicUser;
  organization?: PublicOrganization;
  docId?: string;
  status: InvitationStatus;
  date: Timestamp;
}

export const enum InvitationStatus {
  accepted = 'accepted',
  declined = 'declined',
  pending = 'pending'
}

export const enum InvitationType {
  fromUserToOrganization = 'fromUserToOrganization',
  fromOrganizationToUser = 'fromOrganizationToUser',
  toWorkOnDocument = 'toWorkOnDocument'
}

/** Required options to create an invitation to join organization (both from user and organization). */
export interface InvitationToJoinOrganizationOptions {
  id: string;
  organization: PublicOrganization;
  user: PublicUser;
  type: InvitationType;
}

/** Required options to create an invitation to work on a document. */
export interface InvitationToWorkOnDocument {
  id: string;
  organization: PublicOrganization;
  docId: string;
}

export function createInvitationToJoinOrganization(params: InvitationToJoinOrganizationOptions): Invitation {
  return {
    app: 'main',
    status: InvitationStatus.pending,
    type: InvitationType.fromUserToOrganization,
    date: firestore.Timestamp.now(),
    ...params
  };
}

export function createInvitationToDocument(params: InvitationToWorkOnDocument): Invitation {
  return {
    app: 'media_delivering',
    status: InvitationStatus.pending,
    type: InvitationType.toWorkOnDocument,
    date: firestore.Timestamp.now(),
    ...params
  };
}
