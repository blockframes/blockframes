import { firestore } from 'firebase/app';
import { User } from '@blockframes/auth';
import { Organization } from '@blockframes/organization';
import { Delivery } from '@blockframes/material';
type Timestamp = firestore.Timestamp;

export interface Invitation {
  id: string;
  app: string;
  type: InvitationType;
  userId?: string;
  user?: User;
  organization?: Organization;
  organizationId: string;
  docId?: string;
  document?: Delivery;
  state: 'accepted' | 'declined' | 'pending';
  date: Timestamp;
}

export const enum InvitationType {
  fromUserToOrganization = 'fromUserToOrganization',
  fromOrganizationToUser = 'fromOrganizationToUser',
  stakeholder = 'stakeholder'
}

/** Required options to create an invitation to join organization. */
export interface InvitationToJoinOrganizationOptions {
  id: string;
  organizationId: string;
  userId: string;
}

export function createInvitationToJoinOrganization(params: InvitationToJoinOrganizationOptions): Invitation {
  return {
    app: 'main',
    state: 'pending',
    type: InvitationType.fromUserToOrganization,
    date: firestore.Timestamp.now(),
    ...params
  };
}

export function createInvitationToOrganization(params: InvitationToJoinOrganizationOptions): Invitation {
  return {
    app: 'main',
    state: 'pending',
    type: InvitationType.fromOrganizationToUser,
    date: firestore.Timestamp.now(),
    ...params
  };
}
