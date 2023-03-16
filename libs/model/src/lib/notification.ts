import { createInternalDocumentMeta, DocumentMeta } from './meta';
import { PublicUser } from './user';
import { PublicOrganization } from './organisation';
import { PublicInvitation } from './invitation';
import { Bucket } from './bucket';
import { StorageFile } from './media';
import { App, EmailErrorCode } from './static';

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
    'screenerRequested',
    'screenerRequestSent',
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
    'invitationToAttendSlateCreated',
    'screeningRequested',
    'screeningRequestSent',
    'userMissedScreening',
    'userAttendedScreening',
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
    // Other notifications
    'organizationAcceptedByArchipelContent',
    'orgAppAccessChanged',
    'userRequestAppAccess',
  ] as const,
  financiers: [] as const,
  crm: [] as const,
  waterfall: [] as const,
}

type AppNotificationType = typeof notifications;
type AppNotificationKey = keyof AppNotificationType;
export type NotificationTypes = typeof notifications[AppNotificationKey][number];
export const notificationTypes = [...notifications.festival, ...notifications.catalog, ...notifications.shared];

function isNotificationType<K extends keyof AppNotificationType>(
  type: NotificationTypes,
  kind: K
): type is AppNotificationType[K][number] {
  const notif: string[] = notifications[kind] as any;
  return notif.includes(type);
}

export function isAppNotification(type: NotificationTypes, app: App) {
  return isNotificationType(type, app) || isNotificationType(type, 'shared');
}

/** Generic informations for a Notification. */
export interface Notification {
  _meta: DocumentMeta;
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
  bucket?: Bucket;
  appAccess?: App;
  data?: Record<string, string>;
  /** @dev Type of the notification */
  type: NotificationTypes;
  email?: {
    isSent: boolean;
    error?: EmailErrorCode;
  },
  app?: {
    isRead: boolean;
  },
  message?: string;
  imgRef?: StorageFile;
  placeholderUrl?: string;
  url?: string;
  actionText?: string;
}

/** Create a Notification with required and generic information. */
export function createNotification(notification: Partial<Notification> = {}): Notification {
  return {
    id: notification.id,
    _meta: createInternalDocumentMeta(),
    type: notification.type,
    toUserId: '',
    ...notification
  };
}