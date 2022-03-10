import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { PublicInvitation, PublicUser } from '@blockframes/model';
import { firestore } from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { EmailErrorCodes } from '@blockframes/utils/emails/utils';
import { Bucket } from '@blockframes/contract/bucket/+state/bucket.firestore';
import { App } from '@blockframes/utils/apps';

// Type of notification used in front
export const notificationTypesBase = [
  // Notifications relative to movies
  'movieAccepted',
  'movieAskingPriceRequested',
  'movieAskingPriceRequestSent',

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
  'screeningRequested',
  'screeningRequestSent',

  // Notifications related to offers
  'contractCreated',
  'offerCreatedConfirmation',
  'underSignature',

  //Notifications related to contract negotiation
  'createdCounterOffer',
  'receivedCounterOffer',
  'myContractWasAccepted',
  'myOrgAcceptedAContract',
  'myContractWasDeclined',
  'myOrgDeclinedAContract',
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
  'userRequestAppAccess',

  // Offer notifications.
  'offerAccepted',
  'offerDeclined',
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
  /**
   * To be used for docs that are part of a subcollection
   * eg: contracts/{contractId}/negotiations/{negotiationId}
   */
  docPath?: string;
  offerId?: string,
  organization?: PublicOrganization;
  invitation?: PublicInvitation;
  bucket?: Bucket<Timestamp>;
  appAccess?: App;
  data?: Record<string, string>;
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

export type NotificationDocument = NotificationBase<Timestamp>
