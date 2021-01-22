import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { PublicMovie } from '@blockframes/movie/types';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { firestore } from 'firebase-admin';
import { DocumentMeta } from '@blockframes/utils/models-meta';

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
  'invitationToAttendEventAccepted' |
  'invitationToAttendEventDeclined'
  ;

export interface NotificationMeta<D> extends DocumentMeta<D> {
  email: {
    active: boolean,
    sent: boolean,
  },
  app: {
    active: boolean,
    isRead: boolean;
  }
}

/** Generic informations for a Notification. */
export interface NotificationBase<D> {
  _meta: NotificationMeta<D>;
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
}

type Timestamp = firestore.Timestamp;

export interface NotificationDocument extends NotificationBase<Timestamp> {
}
