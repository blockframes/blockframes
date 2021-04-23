import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { PublicMovie } from '@blockframes/movie/types';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { PublicInvitation } from '@blockframes/invitation/+state/invitation.firestore';
import { firestore } from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { EmailErrorCodes } from '@blockframes/utils/emails/utils';
import { Bucket } from '@blockframes/contract/bucket/+state/bucket.model';

// Type of notification used in front
export const notificationTypesBase = [
  // Notifications relative to movies
  'movieAccepted',

  // Notifications relative to invitations
  'requestFromUserToJoinOrgCreate', // Notification sent to org admins
  'requestFromUserToJoinOrgDeclined',
  'orgMemberUpdated',

  // Events related notifications
  'requestToAttendEventSent',
  'eventIsAboutToStart', // 1h Reminder before event
  'oneDayReminder', // 24h Reminder before event
  'invitationToAttendEventUpdated', // Invitation, accepted or rejected
  'requestToAttendEventUpdated', // Request, accepted or rejected
  'requestToAttendEventCreated',
  'invitationToAttendMeetingCreated',
  'invitationToAttendScreeningCreated',

  // Notifications related to offers
  'offerCreatedConfirmation'
] as const;

// All the other notification types
export const notificationTypesPlus = [
  // Notifications relative to invitations
  'requestFromUserToJoinOrgPending', // Notification sent to the user that made the request
  'invitationToJoinOrgDeclined',

  // Other notifications
  'movieSubmitted', // (catalog only)
  'organizationAcceptedByArchipelContent',
  'orgAppAccessChanged',
] as const;

export type NotificationTypesBase = typeof notificationTypesBase[number];
export type NotificationTypesPlus = typeof notificationTypesPlus[number];
export type NotificationTypes = NotificationTypesBase | NotificationTypesPlus;

/** Generic informations for a Notification. */
export interface NotificationBase<D> {
  _meta: DocumentMeta<D>;
  id: string;
  /** @dev Recipient of the notification */
  toUserId: string;
  /** @dev Possible subjects of the notification */
  user?: Partial<PublicUser>;
  docId?: string;
  movie?: PublicMovie;
  organization?: PublicOrganization;
  invitation?: PublicInvitation;
  bucket?: Bucket;
  /** @dev Type of the notification */
  type: NotificationTypes;
  email?: {
    isSent: boolean;
    error?: EmailErrorCodes;
  },
  app?: {
    isRead: boolean;
  }
}

type Timestamp = firestore.Timestamp;

export interface NotificationDocument extends NotificationBase<Timestamp> {
}
