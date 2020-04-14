import { PublicOrganization } from "@blockframes/organization/organization/+state/organization.firestore";
import { firestore } from 'firebase/app';
import { PublicUser } from "@blockframes/user/+state/user.firestore";
import { App } from "@blockframes/utils/apps";
type Timestamp = firestore.Timestamp;

/** Raw type for Invitation. */
export interface Invitation {
  id: string;
  app: App;
  type: InvitationType;
  mode: InvitationMode,
  status: InvitationStatus;
  date: Timestamp | Date;
  /** @dev An invitation is created by an user or an org (fromOrg or fromUser) */
  fromOrg?: PublicOrganization,
  fromUser?: PublicUser,
  /** @dev An invitation is for an user, an org or an email*/
  toOrg?: PublicOrganization,
  toUser?: PublicUser,
  toEmail?: string,
  /** 
   * @dev Can be a titleId or a eventId for example.
   * If empty, the invitation is about Organization
   */
  docId?: string;
  processedId?: string;
}

/** Specific types of Invitation, both used in firebase functions. */
export type InvitationDocument = InvitationFromOrganizationToUser | InvitationFromUserToOrganization;
export type InvitationOrUndefined = InvitationDocument | undefined;

/** 
 * Specific Invitation/Request to attend an Event.
 * @TODO #2461 When a invitation is created, a backend function will check if:
 * If we have an user or an org we can create a notification.
 * If we have an email, the function will send an email.
 * If user created an account, we will then be able to replace email by user
 * */
export interface InvitationToAnEvent extends Invitation {
  mode: InvitationMode,
  type: 'event';
  /** @dev EventId */
  docId: string;
}

/**  Specific Invitation send by an Organization to a User to join it. */
export interface InvitationFromOrganizationToUser extends Invitation {
  type: 'fromOrganizationToUser';
  mode: 'invitation';
  toUser: PublicUser;
  fromOrg: PublicOrganization;
}

/** Specific Invitation send by a User to join an Organization. */
export interface InvitationFromUserToOrganization extends Invitation {
  type: 'fromUserToOrganization';
  mode: 'request';
  fromUser: PublicUser;
  toOrg: PublicOrganization;
}

/** Status of an Invitation. Set to pending by default, get erased if accepted, archived if declined. */
export type InvitationStatus = 'accepted' | 'declined' | 'pending';

/** Type of Invitation depending of its purpose. */
export type InvitationType = 'fromUserToOrganization' | 'fromOrganizationToUser' | 'event' ;

export type InvitationMode = 'request' | 'invitation';