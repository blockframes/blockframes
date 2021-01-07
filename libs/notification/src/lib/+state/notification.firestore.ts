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
  'eventIsAboutToStart' |
  'invitationToAttendEventAccepted' |
  'invitationToAttendEventDeclined'
  ;

/** Generic informations for a Notification. */
export interface NotificationBase<D> {
  id: string;
  /** @dev Recipient of the notification */
  toUserId?: string;
  /** @dev Possible subjects of the notification */
  user?: Partial<PublicUser>;
  docId?: string;
  movie?: PublicMovie;
  organization?: PublicOrganization;
  /** @dev Type of the notification */
  type: NotificationType;
  isRead: boolean;
  date: D;
}

type Timestamp = firestore.Timestamp;

export interface NotificationDocument extends NotificationBase<Timestamp> {
}
