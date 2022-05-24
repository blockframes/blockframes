import { DocumentMeta } from './meta';
import { PublicUser } from './user';
import { PublicOrganization } from './organisation';
import { PublicInvitation } from './invitation';
import { Bucket } from './bucket';
import { StorageFile } from './media';
import { Timestamp } from './timestamp';
import { App } from './static';
import { EmailErrorCodes } from './emails';

// Type of notification used in front
export const notificationTypesBase = [
  // Notifications relative to movies
  'movieAccepted',
  'movieAskingPriceRequested',
  'movieAskingPriceRequestSent',

  // Notifications relative to invitations
  'requestFromUserToJoinOrgCreate', // Notification sent to org admins
  'requestFromUserToJoinOrgDeclined', // Notification is only disabled but not send anymore. See TODO #8026
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
  // #7946 this may be reactivated later
  // 'underSignature',

  //Notifications related to contract negotiation
  'createdCounterOffer',
  'receivedCounterOffer',
  'myContractWasAccepted',
  'myOrgAcceptedAContract',
  'myContractWasDeclined',
  'myOrgDeclinedAContract',
] as const;

// All the other notification types
const notificationTypesPlus = [
  // Notifications relative to invitations
  'requestFromUserToJoinOrgPending', // Notification sent to the user that made the request
  'invitationToJoinOrgDeclined',

  // Other notifications
  'movieSubmitted', // (catalog only)
  'organizationAcceptedByArchipelContent',
  'orgAppAccessChanged',
  'userRequestAppAccess',

  // Offer notifications.
  // #7946 this may be reactivated later
  // 'offerAccepted',
  // 'offerDeclined',
] as const;

export type NotificationTypesBase = typeof notificationTypesBase[number];
type NotificationTypesPlus = typeof notificationTypesPlus[number];
export type NotificationTypes = NotificationTypesBase | NotificationTypesPlus;

/** Generic informations for a Notification. */
interface NotificationBase<D> {
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

export type NotificationDocument = NotificationBase<Timestamp>;

export interface Notification extends NotificationBase<Date> {
  message: string;
  imgRef?: StorageFile;
  placeholderUrl?: string;
  url?: string;
  actionText?: string;
}
