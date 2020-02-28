import { PublicOrganization } from "@blockframes/organization/types";
import { firestore } from 'firebase/app';
import { PublicUser } from "@blockframes/auth/+state/auth.firestore";
type Timestamp = firestore.Timestamp;

/** Raw type for Invitation. */
export interface InvitationOptions {
  app: string;
  type: InvitationType;
  status: InvitationStatus;
  docId?: string;
  user? : PublicUser;
  organization? : PublicOrganization
  processedId?: string;
}

export interface InvitationDocument extends InvitationOptions {
  id: string;
  date: Timestamp;
}

export type InvitationOrUndefined = InvitationDocument | undefined;

/** Status of an Invitation. Set to pending by default, get erased if accepted, archived if declined. */
export const enum InvitationStatus {
  accepted = 'accepted',
  declined = 'declined',
  pending = 'pending'
}

/** Type of Invitation depending of its purpose. */
export const enum InvitationType {
  fromUserToOrganization = 'fromUserToOrganization',
  fromOrganizationToUser = 'fromOrganizationToUser',
  toWorkOnDocument = 'toWorkOnDocument'
}
