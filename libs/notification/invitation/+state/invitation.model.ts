import { firestore } from 'firebase/app';
import { DocInformations } from 'libs/notification/notification/+state';
import { User } from '@blockframes/auth';
type Timestamp = firestore.Timestamp;

export interface Invitation {
  id: string;
  app: string;
  type: 'joinOrganization' | 'toOrganization'; // This will be extented with other invitations
  userId?: string;
  userEmail?: string;
  user?: User;
  organizationId: string;
  docInformations?: DocInformations;
  state: 'accepted' | 'declined' | 'pending';
  date: Timestamp;
}

/**
 * Required options to create an invitation to join organization
 */
export interface InvitationToJoinOrganizationOptions {
  id: string;
  organizationId: string;
  userId: string;
}

export function createInvitationToJoinOrganization(params: InvitationToJoinOrganizationOptions): Invitation {
  return {
    app: 'main',
    state: 'pending',
    type: 'joinOrganization',
    date: firestore.Timestamp.now(),
    ...params
  };
}

export function createInvitationToOrganization(params: InvitationToJoinOrganizationOptions): Invitation {
  return {
    app: 'main',
    state: 'pending',
    type: 'toOrganization',
    date: firestore.Timestamp.now(),
    ...params
  };
}
