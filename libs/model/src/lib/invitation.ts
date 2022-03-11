import type firebase from 'firebase';
import { Movie, PublicUser, PublicOrganization, Organization } from "@blockframes/model";
import type { InvitationStatus, InvitationType } from "@blockframes/utils/static-model";
import { Event } from '@blockframes/event/+state';

export { InvitationType, InvitationStatus, invitationStatus } from "@blockframes/utils/static-model";
type Timestamp = firebase.firestore.Timestamp;

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
export interface InvitationBase<D extends Timestamp | Date> extends PublicInvitation {
  date: D;
  /** @dev An invitation is created by an user or an org (fromOrg or fromUser) */
  fromOrg?: PublicOrganization,
  fromUser?: PublicUser,
  /** @dev An invitation is for an user or an org */
  toOrg?: PublicOrganization,
  toUser?: PublicUser,
  /**
   * If empty, the invitation is about Organization and we use directly fromOrg.id or toOrg.id
   */
  eventId?: string;
  message?: string;

  /** Watch time in secondes, only used for 'screening' events */
  watchTime?: number;
}

/** Public interface of an invitation (for notifications). */
export interface PublicInvitation {
  id: string;
  type: InvitationType;
  mode: InvitationMode,
  status: InvitationStatus;
}

/** Specific types of Invitation, both used in firebase functions. */
export type InvitationDocument = InvitationBase<Timestamp>;
export type InvitationOrUndefined = InvitationDocument | undefined;

export type InvitationMode = 'request' | 'invitation';

/** Create an Invitation */
export function createInvitation(params: Partial<InvitationBase<Date>> = {}): InvitationBase<Date> {
  return {
    id: '',
    mode: 'invitation',   // We need a default value for backend-function strict mode
    type: 'attendEvent',  // We need a default value for backend-function strict mode
    status: 'pending',
    date: new Date(),
    ...params,
  };
}

export type Invitation = InvitationBase<Date>;

export interface InvitationDetailed extends Invitation {
  org: Organization;
  guestOrg?: Organization;
  event: Event;
  guest?: PublicUser;
  movie?: Movie;
}
