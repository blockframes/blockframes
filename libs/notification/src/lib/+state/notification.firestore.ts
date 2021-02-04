import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { PublicMovie } from '@blockframes/movie/types';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { PublicInvitation } from '@blockframes/invitation/+state/invitation.firestore';
import { firestore } from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { EmailErrorCodes } from '@blockframes/utils/emails/utils';

export const notificationTypes = [
  'organizationAcceptedByArchipelContent',
  'orgAppAccessChanged',

  // Notifications relative to movies
  'movieSubmitted', // (catalog only)
  'movieAccepted',

  // Notifications relative to invitations
  'requestFromUserToJoinOrgCreate',
  'invitationFromUserToJoinOrgDecline',
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

  // @TODO #4859 remove once all notification of theses types are read or deleted (since we cannot make a migration script)
  'invitationToAttendEventAccepted',
  'invitationToAttendEventDeclined',
  'memberAddedToOrg',
  'memberRemovedFromOrg'
] as const;
export type NotificationType = typeof notificationTypes[number];

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
  invitation?: PublicInvitation,
  /** @dev Type of the notification */
  type: NotificationType;
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
