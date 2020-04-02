import { PublicOrganization } from "@blockframes/organization/organization/+state/organization.firestore";
import { firestore } from 'firebase/app';
import { PublicUser } from "@blockframes/auth/+state/auth.firestore";
import { App } from "@blockframes/utils/apps";
type Timestamp = firestore.Timestamp;

/** Raw type for Invitation. */
export interface Invitation {
  id: string;
  app: App;
  type: InvitationType;
  mode?: InvitationMode,
  status: InvitationStatus;
  date: Timestamp;
  /** 
   * @dev Can be a titleId or a eventId for example.
   * If empty, the invitation is about Organization
   */
  docId?: string;
  processedId?: string;
}

/** Specific types of Invitation, both used in firebase functions. */
export type InvitationDocument = InvitationToWorkOnDocument | InvitationFromOrganizationToUser | InvitationFromUserToOrganization;
export type InvitationOrUndefined = InvitationDocument | undefined;

/** Specific Invitation send by an Organization to another Organization to work on a document. */
export interface InvitationToWorkOnDocument extends Invitation {
  type: 'toWorkOnDocument';
  /** @dev TitleId for example*/
  docId: string;
  /**
   *  @TODO (#2244) should rename to better understand
   * who is inviting and who is invited.
   */
  organization: PublicOrganization;
  user?: PublicUser;
}



/** 
 * Specific Invitation/Request to attend an Event.
 * @see #2244 When a invitation is created
 * A backend function will check if:
 * If we have an user or an org we can create a notification.
 * If we have an email, the function will send an email.
 * If user created an account, we will then be able to replace email by user
 * */
export interface InvitationToAnEvent extends Invitation {
  mode: InvitationMode,
  type: 'event';
  fromOrg?: PublicOrganization,
  fromUser?: PublicUser,
  toOrg?: PublicOrganization,
  toUser?: PublicUser,
  toEmail?: string,
  /** @dev EventId */
  docId: string;
}

/**  Specific Invitation send by an Organization to a User to join it. */
export interface InvitationFromOrganizationToUser extends Invitation {
  type: 'fromOrganizationToUser';
  /**
   *  @TODO (#2244) should rename to better understand
   * who is inviting and who is invited.
   */
  user: PublicUser;
  organization: PublicOrganization;
}

/** Specific Invitation send by a User to join an Organization. */
export interface InvitationFromUserToOrganization extends Invitation {
  type: 'fromUserToOrganization';
  /**
   *  @TODO (#2244) should rename to better understand
   * who is inviting and who is invited.
   */
  user: PublicUser;
  organization: PublicOrganization;
}

/** Status of an Invitation. Set to pending by default, get erased if accepted, archived if declined. */
export type InvitationStatus = 'accepted' | 'declined' | 'pending';

/** Type of Invitation depending of its purpose. */
export type InvitationType = 'fromUserToOrganization' | 'fromOrganizationToUser' | 'toWorkOnDocument' | 'event' ;

export type InvitationMode = 'request' | 'invitation';