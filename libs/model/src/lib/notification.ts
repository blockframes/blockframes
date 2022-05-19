import { DocumentMeta } from './meta';
import { EmailErrorCodes } from '@blockframes/utils/emails/utils';
import { PublicUser } from './user';
import { PublicOrganization } from './organisation';
import { PublicInvitation } from './invitation';
import { Bucket } from './bucket';
import { StorageFile } from './media';
import { Timestamp } from './timestamp';
import { App } from './static';

export const notifications = {
  catalog: [
    'contractCreated',
    'offerCreatedConfirmation',
    'createdCounterOffer',
    'receivedCounterOffer',
    'myContractWasAccepted',
    'myOrgAcceptedAContract',
    'myContractWasDeclined',
    'myOrgDeclinedAContract',
    'movieSubmitted',
      // #7946 this may be reactivated later
    // 'underSignature',
    // 'offerAccepted',
    // 'offerDeclined',
  ] as const,
  festival: [
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
  ] as const,
  shared: [
    // Notifications relative to movies
    'movieAccepted',
    'movieAskingPriceRequested',
    'movieAskingPriceRequestSent',
    // Notifications relative to invitations
    'requestFromUserToJoinOrgCreate', // Notification sent to org admins
    'requestFromUserToJoinOrgDeclined', // Notification is only disabled but not send anymore. See TODO #8026
    'orgMemberUpdated', 
    'requestFromUserToJoinOrgPending', // Notification sent to the user that made the request
    'invitationToJoinOrgDeclined',
    // Other notifications
    'organizationAcceptedByArchipelContent',
    'orgAppAccessChanged',
    'userRequestAppAccess',
  ] as const
}

export type NotificationTypes = typeof notifications.catalog[number] | typeof notifications.festival[number] | typeof notifications.shared[number];
export const notificationTypes = [...notifications.festival, ...notifications.catalog, ...notifications.shared];
type AppNotificationType = typeof notifications;
function isNotificationType<K extends keyof AppNotificationType>(
  type: NotificationTypes,
  kind: K
): type is AppNotificationType[K][number] {
  const notif: string[] = notifications[kind] as any;
  return notif.includes(type);
}

export function isAppNotification(type: NotificationTypes, app: 'festival' | 'catalog') {
  return isNotificationType(type, app) || isNotificationType(type, 'shared');
}

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
