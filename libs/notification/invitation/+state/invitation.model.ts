import { firestore } from 'firebase/app';
import { DocInformations } from 'libs/notification/notification/+state';
import { User } from '@blockframes/auth';
type Timestamp = firestore.Timestamp;

export interface Invitation {
  id: string;
  app: string;
  type: InvitationType;
  userId?: string;
  user?: User;
  organizationId: string;
  docInformations?: DocInformations;
  state: 'accepted' | 'declined' | 'pending';
  date: Timestamp;
}

export const enum InvitationType {
  joinOrganization = 'joinOrganization',
  toOrganization = 'toOrganization'
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
    type: InvitationType.joinOrganization,
    date: firestore.Timestamp.now(),
    ...params
  };
}

export function createInvitationToOrganization(params: InvitationToJoinOrganizationOptions): Invitation {
  return {
    app: 'main',
    state: 'pending',
    type: InvitationType.toOrganization,
    date: firestore.Timestamp.now(),
    ...params
  };
}
