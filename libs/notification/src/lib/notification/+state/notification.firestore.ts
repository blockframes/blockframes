import { PublicOrganization } from '@blockframes/organization/+state/organization.firestore';
import { PublicMovie } from '@blockframes/movie/types';
import { PublicUser } from '@blockframes/user/+state/user.firestore';
import { firestore } from 'firebase-admin';

/** Type of Notification depending of its origin. */
export type NotificationType =
  'newSignature' |
  'finalSignature' |
  'createDocument' |
  'deleteDocument' |
  'updateDocument' |
  'inviteOrganization' |
  'removeOrganization' |
  'pathToDocument' |
  'organizationAcceptedByArchipelContent' |
  'movieSubmitted' |
  'movieAccepted' |
  'movieTitleUpdated' |
  'movieTitleCreated' |
  'movieDeleted' |
  'invitationFromUserToJoinOrgDecline' |
  'invitationFromOrganizationToUserDecline' |
  'memberAddedToOrg' |
  'memberRemovedFromOrg' |
  'newContract' |
  'contractInNegotiation' |

  // Events related notifications
  'eventIsAboutToStart' |
  'invitationToAttendEventAccepted' |
  'invitationToAttendEventDeclined'
;

/** Minimum required informations to create a Notification. */
export interface NotificationOptions {
  /** @dev Recipient of the notification */
  toUserId: string;
  /** @dev Possible subjects of the notification */
  user?: Partial<PublicUser>;
  /** @dev Subject the notification */
  docId?: string;
  movie?: PublicMovie;
  /** @dev Subject the notification */
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
