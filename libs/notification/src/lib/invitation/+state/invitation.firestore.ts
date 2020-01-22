import { PublicOrganization } from "@blockframes/organization/types";
import { firestore } from 'firebase/app';
import { PublicUser } from "@blockframes/auth/+state/auth.firestore";
type Timestamp = firestore.Timestamp;

/** Raw type for Invitation. */
export interface Invitation {
  id: string;
  app: string;
  type: InvitationType;
  status: InvitationStatus;
  date: Timestamp;
  docId?: string;
  processedId?: string;
}

/** Specific types of Invitation, both used in firebase functions. */
export type InvitationDocument = InvitationToWorkOnDocument | InvitationFromOrganizationToUser | InvitationFromUserToOrganization;
export type InvitationOrUndefined = InvitationDocument | undefined;

/** Specific Invitation send by an Organization to another Organization to work on a document. */
export interface InvitationToWorkOnDocument extends Invitation {
  type: InvitationType.toWorkOnDocument;
  docId: string;
  organization: PublicOrganization;
  user?: PublicUser;
}

/**  Specific Invitation send by an Organization to a User to join it. */
export interface InvitationFromOrganizationToUser extends Invitation {
  type: InvitationType.fromOrganizationToUser;
  user: PublicUser;
  organization: PublicOrganization;
}

/** Specific Invitation send by a User to join an Organization. */
export interface InvitationFromUserToOrganization extends Invitation {
  type: InvitationType.fromUserToOrganization;
  user: PublicUser;
  organization: PublicOrganization;
}

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
