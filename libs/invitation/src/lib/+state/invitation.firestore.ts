import { PublicOrganization } from "@blockframes/organization/+state/organization.firestore";
import { firestore } from 'firebase/app';
import { PublicUser } from "@blockframes/user/+state/user.firestore";

type Timestamp = firestore.Timestamp;

/** 
 * Raw type for Invitation.
 * 
 * For Events:
 *  When a invitation is created, a backend function will check if:
 *  If we have an user or an org we can create a notification.
 *  If we have an email, the function will send an email.
 *  If user that received an email invitation and
 *  created an account, we will then be able to replace email by the coresponding new user.
 * */
export interface InvitationBase<D> {
  id: string;
  type: InvitationType;
  mode: InvitationMode,
  status: InvitationStatus;
  date: D;
  /** @dev An invitation is created by an user or an org (fromOrg or fromUser) */
  fromOrg?: PublicOrganization,
  fromUser?: PublicUser,
  /** @dev An invitation is for an user or an org */
  toOrg?: PublicOrganization,
  toUser?: PublicUser,
  /**
   * @dev Can only be an eventId.
   * If empty, the invitation is about Organization and we use directly fromOrg.id
   */
  eventId?: string; // @TODO (#4377) rename to eventId
  message?: string;
}

/** Specific types of Invitation, both used in firebase functions. */
export type InvitationDocument = InvitationBase<Timestamp>;
export type InvitationOrUndefined = InvitationDocument | undefined;

/** Status of an Invitation. Set to pending by default, get erased if accepted, archived if declined. */
export type InvitationStatus = 'accepted' | 'declined' | 'pending';

/** Type of Invitation depending of its purpose. */
export type InvitationType = 'attendEvent' | 'joinOrganization';

export type InvitationMode = 'request' | 'invitation';


/** Create an Invitation */
export function createInvitation(params: Partial<InvitationBase<Date>> = {}): InvitationBase<Date> {
  return  {
    id: '',
    mode: 'invitation',   // We need a default value for backend-function strict mode
    type: 'attendEvent',  // We need a default value for backend-function strict mode
    eventId: '',
    status: 'pending',
    date: new Date(),
    ...params,
  };
}
