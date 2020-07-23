import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { PublicMovie } from '@blockframes/movie/types';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { firestore } from 'firebase-admin';

/** Type of Notification depending of its origin. */
export type NotificationType =

  'organizationAcceptedByArchipelContent' |

  // Notifications relative to movies
  'movieSubmitted' | // (catalog only)
  'movieAccepted' |

  // Notifications relative to invitations
  'invitationFromUserToJoinOrgDecline' |
  'memberAddedToOrg' |
  'memberRemovedFromOrg' |

  // Notifications relative to contracts (only for catalog app)
  'newContract' |
  'contractInNegotiation' |

  // Events related notifications
  'requestToAttendEventSent' |
  'eventIsAboutToStart' | // TODO the backend code is not yet ready issue #2555
  'invitationToAttendEventAccepted' |
  'invitationToAttendEventDeclined'
  ;

/** Minimum required information to create a Notification. */
export interface NotificationOptions {
  /** @dev Recipient of the notification */
  toUserId?: string;
  /** @dev Possible subjects of the notification */
  user?: Partial<PublicUser>;
  docId?: string;
  movie?: PublicMovie;
  organization?: PublicOrganization;
  /** @dev Type of the notification */
  type: NotificationType;
}

/** Generic informations for a Notification. */
export interface NotificationDocument<D extends Date | firestore.Timestamp = firestore.Timestamp> extends NotificationOptions {
  id: string;
  isRead: boolean;
  date: D;
};
