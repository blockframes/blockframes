import { firestore } from 'firebase/app';
import { DocInformations } from 'libs/notification/notification/+state';
type Timestamp = firestore.Timestamp;

export interface Invitation {
  id: string;
  app: string;
  type: 'joinOrganization'; // This will be extented with other invitations
  userId?: string;
  organizationId: string;
  docInformations?: DocInformations;
  state: 'accepted' | 'declined' | 'pending';
  date: Timestamp;
}

/**
 * Required options to create an invitation
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
