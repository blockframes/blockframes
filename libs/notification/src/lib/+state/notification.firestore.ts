import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { PublicMovie } from '@blockframes/movie/types';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { firestore } from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';
import { EmailErrorCodes } from '@blockframes/utils/emails/utils';

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
  'eventIsAboutToStart' |
  'oneDayReminder' |
  'invitationToAttendEventAccepted' |
  'invitationToAttendEventDeclined'
  ;


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
