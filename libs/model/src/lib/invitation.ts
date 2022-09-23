import type { App, InvitationStatus, InvitationType } from './static';
import { Organization, PublicOrganization } from './organisation';
import { PublicUser } from './user';
import { Movie } from './movie';
import { Event, Screening } from './event';
import { Analytics } from './analytics';
import { sum } from './utils';

export interface WatchInfos {
  duration: number; // Watch duration in secondes
  date: Date; // Last watch date
}

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
export interface Invitation extends PublicInvitation {
  date: Date;
  /** @dev An invitation is created by a user or an org (fromUser or fromOrg) */
  fromOrg?: PublicOrganization,
  fromUser?: PublicUser,
  /** @dev An invitation is for a user or an org */
  toOrg?: PublicOrganization,
  toUser?: PublicUser,
  /**
   * If empty, the invitation is about Organization and we use directly fromOrg.id or toOrg.id
   */
  eventId?: string;
  message?: string;

  /** Watch information only used for 'screening' and slates events */
  watchInfos?: WatchInfos;
}

/** Public interface of an invitation (for notifications). */
export interface PublicInvitation {
  id: string;
  type: InvitationType;
  mode: InvitationMode,
  status: InvitationStatus;
}

export type InvitationMode = 'request' | 'invitation';

/** Create an Invitation */
export function createInvitation(params: Partial<Invitation> = {}): Invitation {
  return {
    id: '',
    mode: 'invitation',   // We need a default value for backend-function strict mode
    type: 'attendEvent',  // We need a default value for backend-function strict mode
    status: 'pending',
    date: new Date(),
    ...params,
  };
}

export function createPublicInvitation(invitation: Invitation) {
  return {
    id: invitation.id ?? '',
    type: invitation.type ?? '',
    mode: invitation.mode ?? '',
    status: invitation.status ?? '',
  } as PublicInvitation
}

/* 
  We want to display attendEvent invitation in festival only
  JoinOrganisation must be displayed on every app
*/
export function filterInvitation(invitation: Invitation, app: App) {
  return invitation.type === 'attendEvent' ? app === 'festival' : true;
}

export interface InvitationDetailed extends Invitation {
  org: Organization;
  guestOrg?: Organization;
  event: Event;
  guest?: PublicUser;
  movie?: Movie;
}

export interface InvitationWithScreening extends Invitation {
  event: Event<Screening>;
}

type Guest<type> = type extends 'user' ? Invitation['toUser'] : Invitation['toOrg'];

/**
 * Get the guest of an invitation
 */
export function getGuest(invitation: Invitation, guestType: 'user'): (Invitation)['toUser']
export function getGuest(invitation: Invitation, guestType: 'org'): (Invitation)['toOrg']
export function getGuest(invitation: Invitation, guestType: 'user' | 'org' = 'user'): Guest<typeof guestType> {
  const { fromOrg, fromUser, toOrg, toUser, mode } = invitation;
  if (mode === 'invitation') {
    return guestType === 'user' ? toUser : toOrg;
  }
  if (mode === 'request') {
    return guestType === 'user' ? fromUser : fromOrg;
  }
}

export function averageWatchDuration(list: { watchInfos?: WatchInfos }[]) {
  const totalWatchDuration = sum(list, inv => inv.watchInfos?.duration || 0);
  return Math.round(totalWatchDuration / list.length) || 0;
}
